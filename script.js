const videos = {
  scene1: document.getElementById('scene1Video'),
  transition: document.getElementById('transitionVideo'),
  scene2: document.getElementById('scene2Video'),
  scene2Idle: document.getElementById('scene2IdleVideo'),
  scene3: document.getElementById('scene3Video'),
};

const contentTrack = document.getElementById('contentTrack');
const introOverlay = document.getElementById('introOverlay');
const introEnterBtn = document.getElementById('introEnterBtn');
const introAudio = document.getElementById('introAudio');
const enterBtn = document.getElementById('enterBtn');
const progressBar = document.getElementById('progressBar');
const stateText = document.getElementById('stateText');
const navDots = [...document.querySelectorAll('.nav-dot')];

let isIntroActive = true;
let phase = 'scene1-idle';
let isLocked = false;
let transitionDuration = 8.833;
let scene2Duration = 8.767;
let scene2IdleStarted = false;
let lastWheelAt = 0;
let touchStartY = 0;

const setRootDuration = () => {
  const ms = Math.max(1200, transitionDuration * 1000);
  document.documentElement.style.setProperty('--transition-ms', `${ms}ms`);
};

const readMetadata = async () => {
  await Promise.all(Object.values(videos).map(video => new Promise(resolve => {
    if (Number.isFinite(video.duration) && video.duration > 0) return resolve();
    video.addEventListener('loadedmetadata', resolve, { once: true });
  })));

  if (Number.isFinite(videos.transition.duration)) transitionDuration = videos.transition.duration;
  if (Number.isFinite(videos.scene2.duration)) scene2Duration = videos.scene2.duration;
  setRootDuration();
};

const showOnly = (visibleKeys) => {
  Object.entries(videos).forEach(([key, video]) => {
    video.classList.toggle('is-visible', visibleKeys.includes(key));
  });
};

const safePlay = (video) => {
  const promise = video.play();
  if (promise && typeof promise.catch === 'function') {
    promise.catch(() => {});
  }
};

const pauseExcept = (activeKeys) => {
  Object.entries(videos).forEach(([key, video]) => {
    if (!activeKeys.includes(key)) video.pause();
  });
};

const handleEnter = async () => {
  if (!isIntroActive) return;

  // 🎵 触发音频播放
  if (window.audioControllerInstance) {
    try {
      await window.audioControllerInstance.play();
      console.log('✓ 音频自动播放启动');
    } catch (error) {
      console.warn('音频自动播放失败（浏览器策略）:', error);
    }
  }

  isIntroActive = false;
  introOverlay.classList.add('is-leaving');
  introOverlay.setAttribute('aria-hidden', 'true');

  introOverlay.addEventListener('transitionend', () => {
    introOverlay.hidden = true;
  }, { once: true });
  window.setTimeout(() => {
    introOverlay.hidden = true;
  }, 920);
};

const updateDots = (active) => {
  navDots.forEach(dot => {
    const dotScene = dot.dataset.scene || dot.dataset.go;
    dot.classList.toggle('is-active', dotScene === active || (dotScene === '1' && active === 'scene1') || (dotScene === '2' && active === 'scene2') || (dotScene === '3' && active === 'scene3'));
  });
};

const setPhase = (nextPhase) => {
  phase = nextPhase;
  document.body.dataset.phase = nextPhase.replace('-idle', '').replace('-intro', '');

  const label = {
    'scene1-idle': 'Scene 01 · Idle Loop',
    'transition': 'Transition 01 → 02',
    'scene2-intro': 'Scene 02 · Intro Playing',
    'scene2-idle': 'Scene 02 · Last Second Loop',
    'scene3-idle': 'Scene 03 · Gallery',
    'transition-2-3': 'Transition 02 → 03',
    'transition-3-2': 'Transition 03 → 02',
  }[nextPhase] || nextPhase;

  stateText.textContent = label;

  if (nextPhase.startsWith('scene3')) {
    updateDots('scene3');
  } else if (nextPhase.startsWith('scene2')) {
    updateDots('scene2');
  } else {
    updateDots('scene1');
  }
};

const resetProgress = () => {
  progressBar.style.width = '0%';
};

const frameLoop = () => {
  if (phase === 'transition') {
    const pct = Math.min(100, (videos.transition.currentTime / transitionDuration) * 100);
    progressBar.style.width = `${pct}%`;
  }

  if (phase === 'scene2-intro') {
    const idleStart = Math.max(0, scene2Duration - 1.02);
    const pct = Math.min(100, (videos.scene2.currentTime / scene2Duration) * 100);
    progressBar.style.width = `${pct}%`;

    // 在第二场景进入最后一秒时切换到专门切出的 last-second loop，避免播放结束后再跳回导致断点明显。
    if (!scene2IdleStarted && videos.scene2.currentTime >= idleStart) {
      scene2IdleStarted = true;
      videos.scene2Idle.currentTime = 0;
      safePlay(videos.scene2Idle);
      showOnly(['scene2Idle']);
      setPhase('scene2-idle');
      pauseExcept(['scene2Idle']);
      progressBar.style.width = '100%';
      isLocked = false;
    }
  }

  requestAnimationFrame(frameLoop);
};

const goScene2 = async () => {
  if (isLocked || phase !== 'scene1-idle') return;
  isLocked = true;
  scene2IdleStarted = false;
  resetProgress();

  contentTrack.classList.add('is-moving');
  setPhase('transition');
  showOnly(['transition']);
  pauseExcept(['transition']);

  videos.transition.currentTime = 0;
  safePlay(videos.transition);

  // CSS 横向移动和转场视频同步；视频 ended 后再启动第二场景动画。
  videos.transition.addEventListener('ended', () => {
    showOnly(['scene2']);
    pauseExcept(['scene2']);

    videos.scene2.currentTime = 0;
    setPhase('scene2-intro');
    safePlay(videos.scene2);
  }, { once: true });
};

const goScene1 = () => {
  if (isLocked || phase === 'transition') return;
  isLocked = true;
  contentTrack.classList.add('is-moving');

  showOnly(['scene1']);
  pauseExcept(['scene1']);
  videos.scene1.currentTime = 0;
  safePlay(videos.scene1);

  document.body.dataset.phase = 'scene1';
  setTimeout(() => {
    setPhase('scene1-idle');
    resetProgress();
    isLocked = false;
  }, Math.min(1200, transitionDuration * 1000));
};

const goScene3 = () => {
  if (isLocked || phase !== 'scene2-idle') return;
  isLocked = true;

  // Fade out scene2
  videos.scene2Idle.style.transition = 'opacity 0.8s ease';
  videos.scene2Idle.style.opacity = '0';

  setTimeout(() => {
    videos.scene2Idle.pause();
    showOnly([]);

    // Fade in scene3
    videos.scene3.style.display = 'block';
    videos.scene3.style.opacity = '0';
    videos.scene3.currentTime = 0;
    safePlay(videos.scene3);

    requestAnimationFrame(() => {
      videos.scene3.style.transition = 'opacity 0.8s ease';
      videos.scene3.style.opacity = '1';
    });

    // Scroll to scene3
    contentTrack.style.transition = `transform ${transitionDuration * 1000}ms var(--ease-cinema)`;
    contentTrack.style.transform = 'translateX(-200vw)';

    setTimeout(() => {
      phase = 'scene3-idle';
      isLocked = false;
      updateDots('scene3');

      // Notify gallery system
      window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 3 } }));
    }, transitionDuration * 1000);

  }, 800);
};

const goBackToScene2 = () => {
  if (isLocked || phase !== 'scene3-idle') return;
  isLocked = true;

  // Fade out scene3
  videos.scene3.style.transition = 'opacity 0.8s ease';
  videos.scene3.style.opacity = '0';

  setTimeout(() => {
    videos.scene3.pause();
    showOnly([]);

    // Fade in scene2
    videos.scene2Idle.style.display = 'block';
    videos.scene2Idle.style.opacity = '0';
    videos.scene2Idle.currentTime = 0;
    safePlay(videos.scene2Idle);

    requestAnimationFrame(() => {
      videos.scene2Idle.style.transition = 'opacity 0.8s ease';
      videos.scene2Idle.style.opacity = '1';
    });

    // Scroll to scene2
    contentTrack.style.transition = `transform ${transitionDuration * 1000}ms var(--ease-cinema)`;
    contentTrack.style.transform = 'translateX(-100vw)';

    setTimeout(() => {
      phase = 'scene2-idle';
      isLocked = false;
      updateDots('scene2');

      // Notify gallery system
      window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 2 } }));
    }, transitionDuration * 1000);

  }, 800);
};

const handleWheel = (event) => {
  event.preventDefault();
  if (isIntroActive) return;

  const now = Date.now();
  if (now - lastWheelAt < 700) return;
  lastWheelAt = now;

  // Scene3 area-based routing
  if (phase === 'scene3-idle') {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Photo interaction area: 30-70vw × 20-80vh
    const inPhotoArea = (
      event.clientX > viewportWidth * 0.3 &&
      event.clientX < viewportWidth * 0.7 &&
      event.clientY > viewportHeight * 0.2 &&
      event.clientY < viewportHeight * 0.8
    );

    if (inPhotoArea) {
      // Route to gallery-3d.js wheel handler
      window.dispatchEvent(new CustomEvent('gallery:wheel', { detail: { deltaY: event.deltaY } }));
      return;
    }

    // Outside photo area: allow scene navigation back to scene2
    if (event.deltaY < -18) {
      goBackToScene2();
    }
    return;
  }

  if (event.deltaY > 18) {
    if (phase === 'scene1-idle') goScene2();
    else if (phase === 'scene2-idle') goScene3();
  }
  if (event.deltaY < -18) {
    if (phase === 'scene2-idle' || phase === 'scene2-intro') goScene1();
  }
};

const handleTouchStart = (event) => {
  if (isIntroActive) return;
  touchStartY = event.touches[0].clientY;
};

const handleTouchEnd = (event) => {
  if (isIntroActive) return;
  const endY = event.changedTouches[0].clientY;
  const delta = touchStartY - endY;
  if (Math.abs(delta) < 42) return;
  if (delta > 0) goScene2();
  else goScene1();
};

const warmUpAutoplay = () => {
  Object.values(videos).forEach(video => {
    video.muted = true;
    video.playsInline = true;
  });
  safePlay(videos.scene1);

  // Initialize scene3 video
  if (videos.scene3) {
    videos.scene3.currentTime = 0;
    videos.scene3.pause();
  }
};

introEnterBtn.addEventListener('click', handleEnter);
enterBtn.addEventListener('click', goScene2);
window.addEventListener('wheel', handleWheel, { passive: false });
window.addEventListener('touchstart', handleTouchStart, { passive: true });
window.addEventListener('touchend', handleTouchEnd, { passive: true });

document.querySelector('[data-go="scene1"]').addEventListener('click', goScene1);
document.querySelector('[data-go="scene2"]').addEventListener('click', goScene2);

readMetadata().then(() => {
  document.body.dataset.phase = 'scene1';
  setPhase('scene1-idle');
  showOnly(['scene1']);
  warmUpAutoplay();
  frameLoop();
});
