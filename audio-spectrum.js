class AudioSpectrumEffect {
  constructor(container, options = {}) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.resizeHandler = null;

    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.audioSource = null;
    this.audioElement = null;
    this.isPlaying = false;

    this.canvasWidth = 0;
    this.canvasHeight = 0;

    this.options = {
      fftSize: options.fftSize || 256,
      smoothingTimeConstant: options.smoothingTimeConstant || 0.75,
      barCount: options.barCount || (this.isMobile() ? 32 : 64),
      barColor: options.barColor || 'rgba(100, 220, 220, 0.8)',
      barGlowColor: options.barGlowColor || 'rgba(255, 255, 255, 0.6)',
      minHeight: options.minHeight || 2,
      barSpacing: options.barSpacing || (this.isMobile() ? 2 : 3),
      maxWidth: options.maxWidth || 200,
      layout: options.layout || 'horizontal',
      barWidth: options.barWidth || 3,
      position: options.position || 'bottom',
      sensitivity: options.sensitivity || 1.2,
      opacity: options.opacity || 0.85,
      ...options,
    };

    this.init();
  }

  isMobile() {
    return window.innerWidth < 768;
  }

  init() {
    this.createCanvas();
    this.setupAudioContext();
    this.setupEventListeners();
    this.startAnimation();
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'audio-spectrum-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');

    if (this.options.position === 'compact-center') {
      Object.assign(this.canvas.style, {
        position: 'absolute',
        top: 'auto',
        bottom: 'calc(clamp(20px, 4vh, 44px) + 18px)',
        left: '50%',
        width: `${this.options.maxWidth}px`,
        height: '60px',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: '3',
        opacity: this.options.opacity,
        filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.18))',
      });
    } else {
      Object.assign(this.canvas.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '3',
        opacity: this.options.opacity,
      });
    }

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.container.appendChild(this.canvas);
    this.resizeCanvas();
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    if (this.options.position === 'compact-center') {
      const width = this.isMobile() ? Math.min(this.options.maxWidth, 120) : this.options.maxWidth;
      const height = 60;

      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;

      this.canvasWidth = width;
      this.canvasHeight = height;
    } else {
      const rect = this.container.getBoundingClientRect();

      this.canvas.width = Math.round(rect.width * dpr);
      this.canvas.height = Math.round(rect.height * dpr);
      this.canvas.style.width = `${rect.width}px`;
      this.canvas.style.height = `${rect.height}px`;

      this.canvasWidth = rect.width;
      this.canvasHeight = rect.height;
    }

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setupAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.options.fftSize;
      this.analyser.smoothingTimeConstant = this.options.smoothingTimeConstant;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (error) {
      console.warn('Web Audio API is not available:', error);
    }
  }

  connectAudio(source) {
    if (!this.audioContext || !this.analyser) {
      console.warn('AudioContext is not initialized');
      return;
    }

    try {
      if (this.audioSource) {
        this.audioSource.disconnect();
      }

      if (source instanceof HTMLAudioElement) {
        this.audioElement = source;
        this.audioSource = this.audioContext.createMediaElementSource(source);
      } else if (source instanceof MediaStream) {
        this.audioSource = this.audioContext.createMediaStreamSource(source);
      } else {
        throw new Error('Unsupported audio source type');
      }

      this.audioSource.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      this.isPlaying = true;
    } catch (error) {
      console.error('Failed to connect audio source:', error);
    }
  }

  loadAudio(audioUrl) {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
    }

    this.audioElement.src = audioUrl;
    this.audioElement.loop = true;
    this.audioElement.addEventListener('canplay', () => {
      this.connectAudio(this.audioElement);
    }, { once: true });

    return this.audioElement;
  }

  async play() {
    if (!this.audioElement) {
      console.warn('No audio loaded');
      return;
    }

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      await this.audioElement.play();
      this.isPlaying = true;
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  }

  pause() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isPlaying = false;
    }
  }

  setVolume(volume) {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  setupEventListeners() {
    this.resizeHandler = () => {
      this.resizeCanvas();
    };
    window.addEventListener('resize', this.resizeHandler);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      this.options.smoothingTimeConstant = 0.9;
    }
  }

  drawSpectrum() {
    if (!this.analyser || !this.dataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    if (!this.isPlaying) return;

    if (this.options.position === 'compact-center') {
      this.drawCompactSpectrum();
      return;
    }

    this.drawFullscreenSpectrum();
  }

  getAverageForBar(index, samplesPerBar) {
    let sum = 0;
    const startIndex = index * samplesPerBar;
    const endIndex = Math.min(startIndex + samplesPerBar, this.dataArray.length);

    for (let j = startIndex; j < endIndex; j += 1) {
      sum += this.dataArray[j];
    }

    return sum / Math.max(1, endIndex - startIndex);
  }

  drawCompactSpectrum() {
    const barCount = this.options.barCount;
    const barWidth = this.options.barWidth || 3;
    const barSpacing = this.options.barSpacing || 4;
    const totalWidth = barCount * barWidth + (barCount - 1) * barSpacing;
    const startX = (this.canvasWidth - totalWidth) / 2;
    const samplesPerBar = Math.max(1, Math.floor(this.dataArray.length / barCount));
    const maxBarHeight = this.canvasHeight * 0.42;

    for (let i = 0; i < barCount; i += 1) {
      const average = this.getAverageForBar(i, samplesPerBar);
      let normalizedHeight = (average / 255) * this.options.sensitivity;
      normalizedHeight = Math.min(normalizedHeight, 1);

      const barHeight = Math.max(this.options.minHeight || 2, normalizedHeight * maxBarHeight);
      const progress = barCount > 1 ? i / (barCount - 1) : 0;
      const arcOffset = this.options.layout === 'arc' ? Math.sin(progress * Math.PI) * 8 : 0;
      const x = startX + i * (barWidth + barSpacing);
      const centerY = this.canvasHeight / 2 + arcOffset;
      const yTop = centerY - barHeight / 2;

      this.ctx.fillStyle = this.options.barGlowColor;
      this.ctx.fillRect(x - 0.7, yTop - 1, barWidth + 1.4, barHeight + 2);

      this.ctx.fillStyle = this.options.barColor;
      this.ctx.fillRect(x, yTop, barWidth, barHeight);
    }
  }

  drawFullscreenSpectrum() {
    const barCount = this.options.barCount;
    const barSpacing = this.options.barSpacing;
    const totalSpacing = barSpacing * (barCount - 1);
    const barWidth = (this.canvasWidth - totalSpacing) / barCount;
    const samplesPerBar = Math.max(1, Math.floor(this.dataArray.length / barCount));

    for (let i = 0; i < barCount; i += 1) {
      const average = this.getAverageForBar(i, samplesPerBar);
      let normalizedHeight = (average / 255) * this.options.sensitivity;
      normalizedHeight = Math.min(normalizedHeight, 1);

      const maxBarHeight = this.canvasHeight * 0.4;
      const barHeight = Math.max(this.options.minHeight, normalizedHeight * maxBarHeight);
      const x = i * (barWidth + barSpacing);
      let y;

      if (this.options.position === 'bottom') {
        y = this.canvasHeight - barHeight;
      } else if (this.options.position === 'top') {
        y = 0;
      } else {
        y = (this.canvasHeight - barHeight) / 2;
      }

      this.ctx.fillStyle = this.options.barGlowColor;
      this.ctx.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);

      this.ctx.fillStyle = this.options.barColor;
      this.ctx.fillRect(x, y, barWidth, barHeight);
    }
  }

  startAnimation() {
    const animate = () => {
      this.drawSpectrum();
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    this.pause();

    if (this.audioSource) {
      this.audioSource.disconnect();
      this.audioSource = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.ctx = null;
  }
}

if (typeof window !== 'undefined') {
  window.AudioSpectrumEffect = AudioSpectrumEffect;
}
