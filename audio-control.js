class AudioController {
  constructor(spectrumEffect, options = {}) {
    this.spectrumEffect = spectrumEffect;
    this.controlPanel = null;
    this.playButton = null;
    this.volumeSlider = null;
    this.isPlaying = false;
    this.boundAlignToNav = null;

    this.options = {
      position: options.position || 'bottom-right',
      defaultVolume: options.defaultVolume || 0.6,
      audioUrl: options.audioUrl || null,
      autoPlay: options.autoPlay || false,
      ...options
    };

    this.init();
  }

  init() {
    this.createControlPanel();
    this.setupNavAlignment();

    if (this.options.audioUrl) {
      this.loadAudio(this.options.audioUrl);
    }
  }

  createControlPanel() {
    this.controlPanel = document.createElement('div');
    this.controlPanel.className = 'audio-control-panel';
    this.controlPanel.setAttribute('role', 'region');
    this.controlPanel.setAttribute('aria-label', '音频控制');

    this.playButton = document.createElement('button');
    this.playButton.className = 'audio-play-btn';
    this.playButton.setAttribute('aria-label', '播放音频');
    this.playButton.innerHTML = `
      <svg class="icon-play" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <svg class="icon-pause" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
    `;

    this.playButton.addEventListener('click', () => {
      this.togglePlayPause();
    });

    const volumeContainer = document.createElement('div');
    volumeContainer.className = 'audio-volume-container';

    const volumeIcon = document.createElement('span');
    volumeIcon.className = 'audio-volume-icon';
    volumeIcon.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
    `;

    this.volumeSlider = document.createElement('input');
    this.volumeSlider.type = 'range';
    this.volumeSlider.className = 'audio-volume-slider';
    this.volumeSlider.min = '0';
    this.volumeSlider.max = '100';
    this.volumeSlider.value = String(this.options.defaultVolume * 100);
    this.volumeSlider.setAttribute('aria-label', '音量');

    this.volumeSlider.addEventListener('input', (event) => {
      const volume = parseInt(event.target.value, 10) / 100;
      this.setVolume(volume);
    });

    volumeContainer.appendChild(volumeIcon);
    volumeContainer.appendChild(this.volumeSlider);
    this.controlPanel.appendChild(this.playButton);
    this.controlPanel.appendChild(volumeContainer);
    document.body.appendChild(this.controlPanel);

    this.playButton.style.display = 'none';
    this.setVolume(this.options.defaultVolume);
  }

  alignToNavIndicator() {
    if (!this.controlPanel) return;

    const navIndicator = document.querySelector('.topbar nav');
    if (!navIndicator) return;

    const navRect = navIndicator.getBoundingClientRect();
    const panelRect = this.controlPanel.getBoundingClientRect();
    const alignedTop = navRect.top + (navRect.height - panelRect.height) / 2;

    this.controlPanel.style.top = `${Math.max(8, alignedTop)}px`;
  }

  setupNavAlignment() {
    if (!this.controlPanel) return;

    this.boundAlignToNav = () => {
      this.alignToNavIndicator();
    };

    requestAnimationFrame(this.boundAlignToNav);
    window.addEventListener('resize', this.boundAlignToNav);
    window.addEventListener('orientationchange', this.boundAlignToNav);
  }

  loadAudio(audioUrl) {
    if (!this.spectrumEffect) {
      console.warn('Audio spectrum effect is not initialized');
      return null;
    }

    const audioElement = this.spectrumEffect.loadAudio(audioUrl);

    if (this.options.autoPlay) {
      audioElement.addEventListener('canplay', () => {
        this.play();
      }, { once: true });
    }

    return audioElement;
  }

  async play() {
    if (!this.spectrumEffect) return;

    try {
      await this.spectrumEffect.play();
      this.isPlaying = true;
      this.updateButtonState();
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  }

  pause() {
    if (!this.spectrumEffect) return;

    this.spectrumEffect.pause();
    this.isPlaying = false;
    this.updateButtonState();
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setVolume(volume) {
    if (this.spectrumEffect) {
      this.spectrumEffect.setVolume(volume);
    }
  }

  updateButtonState() {
    const playIcon = this.playButton.querySelector('.icon-play');
    const pauseIcon = this.playButton.querySelector('.icon-pause');

    if (this.isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      this.playButton.setAttribute('aria-label', '暂停音频');
      this.controlPanel.classList.add('is-playing');
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      this.playButton.setAttribute('aria-label', '播放音频');
      this.controlPanel.classList.remove('is-playing');
    }
  }

  destroy() {
    if (this.boundAlignToNav) {
      window.removeEventListener('resize', this.boundAlignToNav);
      window.removeEventListener('orientationchange', this.boundAlignToNav);
      this.boundAlignToNav = null;
    }

    if (this.controlPanel && this.controlPanel.parentNode) {
      this.controlPanel.parentNode.removeChild(this.controlPanel);
    }

    this.controlPanel = null;
    this.playButton = null;
    this.volumeSlider = null;
  }
}

if (typeof window !== 'undefined') {
  window.AudioController = AudioController;
}
