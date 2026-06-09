/**
 * 特效初始化脚本
 * - 水波纹效果
 * - 音频频谱效果
 * - 效果协调和管理
 */

(function() {
  'use strict';

  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEffects);
  } else {
    initEffects();
  }

  function initEffects() {
    const videoStage = document.querySelector('.video-stage');
    if (!videoStage) {
      console.warn('未找到 .video-stage 容器');
      return;
    }

    // ===== 1. 初始化水波纹效果 =====
    let waterRipple = null;
    if (typeof WaterRippleEffect !== 'undefined') {
      try {
        waterRipple = new WaterRippleEffect(videoStage);
        console.log('✓ 水波纹效果已启动');
      } catch (error) {
        console.error('水波纹效果初始化失败:', error);
      }
    }

    // ===== 2. 初始化音频频谱效果 =====
    let audioSpectrum = null;
    let audioController = null;

    if (typeof AudioSpectrumEffect !== 'undefined' && typeof AudioController !== 'undefined') {
      try {
        // 创建频谱效果
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

        // 创建音频控制器
        audioController = new AudioController(audioSpectrum, {
          position: 'bottom-right',
          defaultVolume: 0.5,
          autoPlay: false // 等待用户交互
        });

        // 导出到全局，供 script.js 调用
        window.audioControllerInstance = audioController;

        console.log('✓ 音频频谱效果已启动');

        // ===== 3. 音频文件管理 =====
        setupAudioManagement(audioController);

      } catch (error) {
        console.error('音频频谱效果初始化失败:', error);
      }
    }

    // ===== 4. 场景切换时的效果协调 =====
    setupSceneCoordination(waterRipple, audioSpectrum);

    // ===== 5. 清理函数（页面卸载时） =====
    window.addEventListener('beforeunload', () => {
      if (waterRipple) waterRipple.destroy();
      if (audioSpectrum) audioSpectrum.destroy();
      if (audioController) audioController.destroy();
    });
  }

  /**
   * 音频文件管理 - 简化版（内置音频）
   */
  function setupAudioManagement(audioController) {
    // 直接加载内置音频文件
    const audioPath = './assets/background-music.mp3';
    console.log('✓ 加载内置音频:', audioPath);
    audioController.loadAudio(audioPath);
  }

  /**
   * 场景切换协调
   * 在不同场景中调整效果参数
   */
  function setupSceneCoordination(waterRipple, audioSpectrum) {
    // 监听场景切换
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
   * 处理场景切换
   */
  function handlePhaseChange(phase, waterRipple, audioSpectrum) {
    console.log('场景切换:', phase);

    // 可以根据不同场景调整效果参数
    switch (phase) {
      case 'scene1':
        // 第一场景：水波纹活跃，频谱适中
        if (waterRipple) {
          waterRipple.canvas.style.opacity = '0.8';
        }
        if (audioSpectrum) {
          audioSpectrum.canvas.style.opacity = '0.8';
        }
        break;

      case 'scene2':
        // 第二场景：效果可以更强烈
        if (waterRipple) {
          waterRipple.canvas.style.opacity = '0.9';
        }
        if (audioSpectrum) {
          audioSpectrum.canvas.style.opacity = '0.85';
        }
        break;

      case 'transition':
        // 转场时：效果减弱
        if (waterRipple) {
          waterRipple.canvas.style.opacity = '0.5';
        }
        if (audioSpectrum) {
          audioSpectrum.canvas.style.opacity = '0.5';
        }
        break;
    }
  }

  // ===== 导出到全局（调试用） =====
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
