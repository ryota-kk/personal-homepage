/**
 * 鐗规晥鍒濆鍖栬剼鏈? * - 姘存尝绾规晥鏋? * - 闊抽棰戣氨鏁堟灉
 * - 鏁堟灉鍗忚皟鍜岀鐞? */

(function() {
  'use strict';

  // 绛夊緟 DOM 鍔犺浇瀹屾垚
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEffects);
  } else {
    initEffects();
  }

  function initEffects() {
    const videoStage = document.querySelector('.video-stage');
    if (!videoStage) {
      console.warn('鏈壘鍒?.video-stage 瀹瑰櫒');
      return;
    }

    // ===== 1. 鍒濆鍖栨按娉㈢汗鏁堟灉 =====
    let waterRipple = null;
    if (typeof WaterRippleEffect !== 'undefined') {
      try {
        waterRipple = new WaterRippleEffect(videoStage);
      } catch (error) {
        console.error('姘存尝绾规晥鏋滃垵濮嬪寲澶辫触:', error);
      }
    }

    // ===== 2. 鍒濆鍖栭煶棰戦璋辨晥鏋?=====
    let audioSpectrum = null;
    let audioController = null;

    if (typeof AudioSpectrumEffect !== 'undefined' && typeof AudioController !== 'undefined') {
      try {
        // 鍒涘缓棰戣氨鏁堟灉
        audioSpectrum = new AudioSpectrumEffect(videoStage, {
          fftSize: 256,
          barCount: window.innerWidth < 768 ? 18 : 24,
          barWidth: 3,
          barSpacing: window.innerWidth < 768 ? 3 : 4,
          maxWidth: window.innerWidth < 768 ? 120 : 190,
          layout: 'arc',
          barColor: 'rgba(255, 255, 255, 0.85)',
          barGlowColor: 'rgba(255, 255, 255, 0.35)',
          position: 'compact-center',
          sensitivity: 1.35,
          opacity: 0.85,
          smoothingTimeConstant: 0.78
        });

        // Create audio controller.
        audioController = new AudioController(audioSpectrum, {
          position: 'bottom-right',
          defaultVolume: 0.5,
          autoPlay: false // 绛夊緟鐢ㄦ埛浜や簰
        });

        // 瀵煎嚭鍒板叏灞€锛屼緵 script.js 璋冪敤
        window.audioControllerInstance = audioController;


        // ===== 3. 闊抽鏂囦欢绠＄悊 =====
        setupAudioManagement(audioController);

      } catch (error) {
        console.error('闊抽棰戣氨鏁堟灉鍒濆鍖栧け璐?', error);
      }
    }

    // ===== 4. 鍦烘櫙鍒囨崲鏃剁殑鏁堟灉鍗忚皟 =====
    setupSceneCoordination(waterRipple, audioSpectrum);

    // ===== 5. 娓呯悊鍑芥暟锛堥〉闈㈠嵏杞芥椂锛?=====
    window.addEventListener('beforeunload', () => {
      if (waterRipple) waterRipple.destroy();
      if (audioSpectrum) audioSpectrum.destroy();
      if (audioController) audioController.destroy();
    });
  }

  /**
   * 闊抽鏂囦欢绠＄悊 - 绠€鍖栫増锛堝唴缃煶棰戯級
   */
  function setupAudioManagement(audioController) {
    // 鐩存帴鍔犺浇鍐呯疆闊抽鏂囦欢
    const audioPath = './assets/background-music.mp3';
    audioController.loadAudio(audioPath);
  }

  /**
   * 鍦烘櫙鍒囨崲鍗忚皟
   * 鍦ㄤ笉鍚屽満鏅腑璋冩暣鏁堟灉鍙傛暟
   */
  function setupSceneCoordination(waterRipple, audioSpectrum) {
    // 鐩戝惉鍦烘櫙鍒囨崲
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-phase') {
          const phase = document.body.dataset.phase;
          handlePhaseChange(phase, waterRipple, audioSpectrum);
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-phase']
    });
  }

  /**
   * 澶勭悊鍦烘櫙鍒囨崲
   */
  function handlePhaseChange(phase, waterRipple, audioSpectrum) {

    // 鍙互鏍规嵁涓嶅悓鍦烘櫙璋冩暣鏁堟灉鍙傛暟
    switch (phase) {
      case 'scene1':
        // 绗竴鍦烘櫙锛氭按娉㈢汗娲昏穬锛岄璋遍€備腑
        if (waterRipple) {
          waterRipple.canvas.style.opacity = '0.8';
        }
        if (audioSpectrum) {
          audioSpectrum.canvas.style.opacity = '0.8';
        }
        break;

      case 'scene2':
        // 绗簩鍦烘櫙锛氭晥鏋滃彲浠ユ洿寮虹儓
        if (waterRipple) {
          waterRipple.canvas.style.opacity = '0.9';
        }
        if (audioSpectrum) {
          audioSpectrum.canvas.style.opacity = '0.85';
        }
        break;

      case 'transition':
        // 杞満鏃讹細鏁堟灉鍑忓急
        if (waterRipple) {
          waterRipple.canvas.style.opacity = '0.5';
        }
        if (audioSpectrum) {
          audioSpectrum.canvas.style.opacity = '0.5';
        }
        break;
    }
  }

  // ===== 瀵煎嚭鍒板叏灞€锛堣皟璇曠敤锛?=====
  window.effectsManager = {
    get waterRipple() {
      return window._waterRippleInstance;
    },
    get audioSpectrum() {
      return window._audioSpectrumInstance;
    },
    get audioController() {
      return window._audioControllerInstance;
    }
  };
})();
