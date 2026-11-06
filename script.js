const videos = {
  scene1: document.getElementById('scene1Video'),
  transition: document.getElementById('transitionVideo'),
  scene2: document.getElementById('scene2Video'),
  scene2Idle: document.getElementById('scene2IdleVideo'),
  scene3: document.getElementById('scene3Video'),
  scene3Loop: document.getElementById('scene3LoopVideo'),
};

const siteShell = document.querySelector('.site-shell');
const contentTrack = document.getElementById('contentTrack');
const introOverlay = document.getElementById('introOverlay');
const sceneFallback = document.getElementById('sceneFallback');
const introEnterBtn = document.getElementById('introEnterBtn');
const introAudio = document.getElementById('introAudio');
const enterBtn = document.getElementById('enterBtn');
const progressBar = document.getElementById('progressBar');
const stateText = document.getElementById('stateText');
const navDots = [...document.querySelectorAll('.nav-dot')];
const mobilePrevBtn = document.querySelector('[data-mobile-prev]');
const mobileNextBtn = document.querySelector('[data-mobile-next]');
const scene2Cards = document.querySelector('.project-cards-grid, .content-grid');
const feedbackForm = document.getElementById('feedbackForm');
const feedbackToast = document.getElementById('feedbackToast');
const feedbackSubmit = feedbackForm?.querySelector('.feedback-submit');
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xeewdkap";

let isIntroActive = true;
let phase = 'scene1-idle';
let isLocked = false;
let transitionDuration = 2.972;
let scene2Duration = 18.483;
let scene2IdleStarted = false;
let lastWheelAt = 0;
let touchStartY = 0;
let touchStartX = 0;
let isTouching = false;
let lastTouchAt = 0;
let projectGridTouchY = 0;
let projectGridScrollTop = 0;
let scene2SkipStarted = false;
let scene3LoopStarted = false;
let isScene2Leaving = false;
let scene2ExitTimer = null;
let sceneRevision = 0;
let backgroundRevision = 0;
let desiredBackground = 'scene1';
let backgroundHideTimer = null;
let cancelVideoCompletion = () => {};
const pendingPlays = new Map();
const VIDEO_START_TIMEOUT = 4000;
const scene2ExitDelay = 320;
const sceneTrackDuration = 900;
const TOUCH_THRESHOLD = 60;
const TOUCH_THROTTLE_MS = 680;
const INTERACTIVE_TOUCH_SELECTOR = 'button, a, input, textarea, select, label, .project-modal-card, .audio-control-panel, .mobile-scene-controls';

const updateAppHeight = () => {
  const height = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${height}px`);
};

const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;

const setRootDuration = () => {
  const ms = Math.max(1200, transitionDuration * 1000);
  document.documentElement.style.setProperty('--transition-ms', `${ms}ms`);
};

const readMetadata = () => {
  const syncDuration = () => {
    if (Number.isFinite(videos.transition.duration)) transitionDuration = videos.transition.duration;
    if (Number.isFinite(videos.scene2.duration)) scene2Duration = videos.scene2.duration;
    setRootDuration();
  };

  videos.transition.addEventListener('loadedmetadata', syncDuration);
  videos.scene2.addEventListener('loadedmetadata', syncDuration);
  syncDuration();
};

const showOnly = (visibleKeys) => {
  Object.entries(videos).forEach(([key, video]) => {
    const isVisible = visibleKeys.includes(key);
    if (!isVisible && key === 'scene1') video.style.opacity = '';
    video.classList.toggle('is-visible', isVisible);
  });
};

const ensureVideoSource = (video) => {
  if (video.getAttribute('src') || !video.dataset.src) return;
  video.src = isMobileViewport() && video.dataset.mobileSrc ? video.dataset.mobileSrc : video.dataset.src;
};

const safePlay = (video) => {
  pendingPlays.get(video)?.();
  ensureVideoSource(video);
  video.muted = true;
  return new Promise(resolve => {
    let settled = false;
    const finish = (started) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onError);
      pendingPlays.delete(video);
      resolve(started);
    };
    const onPlaying = () => finish(video.readyState >= 2);
    const onError = () => finish(false);
    const timer = window.setTimeout(() => finish(false), VIDEO_START_TIMEOUT);
    pendingPlays.set(video, () => finish(false));
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onError);
    try {
      Promise.resolve(video.play()).then(onPlaying, onError);
    } catch {
      finish(false);
    }
  });
};

const showPoster = (key) => {
  if (sceneFallback && videos[key]?.poster) {
    sceneFallback.style.backgroundImage = `url("${videos[key].poster}")`;
    sceneFallback.dataset.scene = key;
  }
};

const cancelBackgroundPlayback = () => {
  backgroundRevision += 1;
  clearTimeout(backgroundHideTimer);
  [...pendingPlays.values()].forEach(cancel => cancel());
};

const beginSceneChange = () => {
  cancelVideoCompletion();
  cancelVideoCompletion = () => {};
  cancelBackgroundPlayback();
  return ++sceneRevision;
};

const activateBackground = async (key, { restart = false } = {}) => {
  cancelBackgroundPlayback();
  const revision = backgroundRevision;
  desiredBackground = key;
  const video = videos[key];
  const previous = Object.keys(videos).filter(id => videos[id].classList.contains('is-visible'));
  showPoster(key);
  if (document.hidden) return false;
  if (restart && video.readyState >= 1) video.currentTime = 0;
  const started = await safePlay(video);
  if (revision !== backgroundRevision) {
    if (desiredBackground !== key) video.pause();
    return false;
  }
  if (!started) {
    video.pause();
    showOnly([]);
    pauseExcept([]);
    return false;
  }
  video.style.opacity = '';
  video.style.transition = '';
  showOnly([...previous, key]);
  backgroundHideTimer = window.setTimeout(() => {
    if (revision !== backgroundRevision) return;
    showOnly([key]);
    pauseExcept([key]);
  }, 700);
  return true;
};

const runWhenVideoCompletes = (video, fallbackMs, callback) => {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    video.removeEventListener('ended', finish);
    window.clearTimeout(timer);
    callback();
  };
  const timer = window.setTimeout(finish, fallbackMs);
  video.addEventListener('ended', finish, { once: true });
  return () => {
    done = true;
    clearTimeout(timer);
    video.removeEventListener('ended', finish);
  };
};

const pauseExcept = (activeKeys) => {
  Object.entries(videos).forEach(([key, video]) => {
    if (!activeKeys.includes(key)) video.pause();
  });
};

const resetScene2Exit = ({ clearTimer = true } = {}) => {
  isScene2Leaving = false;
  if (clearTimer && scene2ExitTimer) {
    window.clearTimeout(scene2ExitTimer);
    scene2ExitTimer = null;
  }
  scene2Cards?.classList.remove('is-leaving');
};

const resetScene3Videos = () => {
  scene3LoopStarted = false;
};

const playScene3Loop = async (revision = sceneRevision) => {
  if (revision !== sceneRevision || !phase.includes('3')) return;
  if (scene3LoopStarted) return;
  scene3LoopStarted = true;
  await activateBackground('scene3Loop', { restart: true });
};

const playScene3Intro = async (revision = sceneRevision) => {
  resetScene3Videos();
  const started = await activateBackground('scene3', { restart: true });
  if (revision !== sceneRevision) return;
  if (!started) {
    void playScene3Loop(revision);
    return;
  }
  const duration = Number.isFinite(videos.scene3.duration) ? videos.scene3.duration : 11;
  cancelVideoCompletion = runWhenVideoCompletes(videos.scene3, duration * 1000 + 1500, () => {
    if (revision === sceneRevision) void playScene3Loop(revision);
  });
};

const handleEnter = () => {
  if (!isIntroActive) return;
  isIntroActive = false;
  void activateBackground('scene1');
  window.audioControllerInstance?.play().catch(error => console.warn('Audio unavailable:', error));
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
    dot.classList.toggle('is-active', dotScene === active || (dotScene === '1' && active === 'scene1') || (dotScene === '2' && active === 'scene2') || (dotScene === '3' && active === 'scene3') || (dotScene === '4' && active === 'scene4'));
  });
};

const setPhase = (nextPhase) => {
  phase = nextPhase;
  document.body.dataset.phase = nextPhase.replace('-idle', '').replace('-intro', '');

  const label = {
    'scene1-idle': 'Scene 01 路 Idle Loop',
    'transition': 'Transition 01 鈫?02',
    'scene2-intro': 'Scene 02 路 Intro Playing',
    'scene2-idle': 'Scene 02 路 Last Second Loop',
    'scene3-idle': 'Scene 03 路 Gallery',
    'scene4-idle': 'Scene 04 路 Contact',
    'transition-2-3': 'Transition 02 鈫?03',
    'transition-3-2': 'Transition 03 鈫?02',
    'transition-3-4': 'Transition 03 鈫?04',
    'transition-4-3': 'Transition 04 鈫?03',
  }[nextPhase] || nextPhase;

  stateText.textContent = label;

  if (nextPhase.startsWith('scene4') || nextPhase === 'transition-3-4') {
    updateDots('scene4');
  } else if (nextPhase.startsWith('scene3') || nextPhase === 'transition-4-3') {
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

const finishScene2Intro = (revision = sceneRevision) => {
  if (revision !== sceneRevision || phase !== 'scene2-intro' || scene2IdleStarted) return;
  cancelVideoCompletion();
  scene2IdleStarted = true;
  setPhase('scene2-idle');
  contentTrack.classList.remove('is-moving');
  progressBar.style.width = '100%';
  isLocked = false;
  void activateBackground('scene2Idle', { restart: true });
  window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 2 } }));
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

    // Switch to the last-second loop near the end of scene2.
    if (!scene2IdleStarted && videos.scene2.currentTime >= idleStart) {
      finishScene2Intro();
    }
  }
};

const goScene2 = async () => {
  if (isLocked || phase !== 'scene1-idle') return;
  const revision = beginSceneChange();
  isLocked = true;
  scene2IdleStarted = false;
  scene2SkipStarted = false;
  resetProgress();
  contentTrack.classList.add('is-moving');
  setPhase('transition');
  const startIntro = async () => {
    if (revision !== sceneRevision) return;
    setPhase('scene2-intro');
    const started = await activateBackground('scene2', { restart: true });
    if (revision !== sceneRevision || phase !== 'scene2-intro') return;
    if (!started) {
      finishScene2Intro(revision);
      return;
    }
    cancelVideoCompletion = runWhenVideoCompletes(videos.scene2, scene2Duration * 1000 + 1500, () => finishScene2Intro(revision));
  };
  const started = await activateBackground('transition', { restart: true });
  if (revision !== sceneRevision) return;
  if (!started) {
    void startIntro();
    return;
  }
  cancelVideoCompletion = runWhenVideoCompletes(videos.transition, transitionDuration * 1000 + 700, () => void startIntro());
};

const goScene1 = ({ force = false } = {}) => {
  if (!force && (isLocked || phase === 'transition')) return;
  const revision = beginSceneChange();
  isLocked = true;
  scene2IdleStarted = true;
  resetScene2Exit();

  contentTrack.classList.add('is-moving');
  contentTrack.style.transition = 'transform 520ms var(--ease-cinema)';
  contentTrack.style.transform = 'translate3d(0,0,0)';

  void activateBackground('scene1', { restart: true });

  document.body.dataset.phase = 'scene1';
  setTimeout(() => {
    if (revision !== sceneRevision) return;
    contentTrack.classList.remove('is-moving');
    contentTrack.style.transition = '';
    contentTrack.style.transform = '';
    setPhase('scene1-idle');
    resetProgress();
    isLocked = false;
    scene2SkipStarted = false;

    // Notify systems of scene change
    window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 1 } }));
  }, 560);
};

const goScene3 = ({ skipScene2Intro = false } = {}) => {
  const canEnterFromScene2Intro = skipScene2Intro && phase === 'scene2-intro';
  if (scene2SkipStarted || (!canEnterFromScene2Intro && (isLocked || phase !== 'scene2-idle'))) return;

  if (canEnterFromScene2Intro) {
    scene2SkipStarted = true;
    scene2IdleStarted = true;
  }

  const revision = beginSceneChange();
  isLocked = true;
  contentTrack.classList.add('is-moving');
  contentTrack.style.transition = `transform ${sceneTrackDuration}ms var(--ease-cinema)`;
  contentTrack.style.transform = 'translateX(-200vw)';
  setPhase('transition-2-3');
  void playScene3Intro(revision);
  setTimeout(() => {
    if (revision !== sceneRevision) return;
    setPhase('scene3-idle');
    contentTrack.classList.remove('is-moving');
    isLocked = false;
    scene2SkipStarted = false;
    resetScene2Exit({ clearTimer: false });

    // Notify gallery system
    window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 3 } }));
  }, sceneTrackDuration);
};

const startScene2ExitToScene3 = ({ skipScene2Intro = false } = {}) => {
  if (isScene2Leaving || scene2SkipStarted) return;
  if (phase !== 'scene2-idle' && phase !== 'scene2-intro') return;

  isScene2Leaving = true;
  isLocked = true;
  scene2Cards?.classList.add('is-leaving');

  scene2ExitTimer = window.setTimeout(() => {
    scene2ExitTimer = null;
    const shouldSkipIntro = skipScene2Intro && phase === 'scene2-intro';
    if (!shouldSkipIntro) isLocked = false;
    if (phase === 'scene2-intro') progressBar.style.width = '100%';
    goScene3({ skipScene2Intro: shouldSkipIntro });
  }, scene2ExitDelay);
};

const skipScene2AndGoScene3 = () => {
  if (phase !== 'scene2-intro' || scene2SkipStarted) return;

  startScene2ExitToScene3({ skipScene2Intro: true });
};

const skipScene2AndGoScene1 = () => {
  if (phase !== 'scene2-intro' || scene2SkipStarted) return;

  scene2SkipStarted = true;
  videos.scene2.pause();
  goScene1({ force: true });
};

const goBackToScene2 = () => {
  if (isLocked || phase !== 'scene3-idle') return;
  const revision = beginSceneChange();
  isLocked = true;
  resetScene2Exit();
  resetScene3Videos();
  setPhase('transition-3-2');
  void activateBackground('scene2Idle', { restart: true });
  contentTrack.style.transition = `transform ${sceneTrackDuration}ms var(--ease-cinema)`;
  contentTrack.style.transform = 'translateX(-100vw)';
  setTimeout(() => {
    if (revision !== sceneRevision) return;
    setPhase('scene2-idle');
    contentTrack.classList.remove('is-moving');
    isLocked = false;
    window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 2 } }));
  }, sceneTrackDuration);
};

const goScene4 = () => {
  if (isLocked || phase !== 'scene3-idle') return;
  const revision = beginSceneChange();
  desiredBackground = null;
  pauseExcept([]);
  isLocked = true;
  setPhase('transition-3-4');
  contentTrack.classList.add('is-moving');
  contentTrack.style.transition = 'transform 900ms var(--ease-cinema)';
  contentTrack.style.transform = 'translateX(-300vw)';

  setTimeout(() => {
    if (revision !== sceneRevision) return;
    setPhase('scene4-idle');
    contentTrack.classList.remove('is-moving');
    videos.scene3.pause();
    videos.scene3Loop.pause();
    progressBar.style.width = '100%';
    isLocked = false;
    window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 4 } }));
  }, 920);
};

const goBackToScene3 = () => {
  if (isLocked || phase !== 'scene4-idle') return;
  const revision = beginSceneChange();
  isLocked = true;
  setPhase('transition-4-3');
  void activateBackground('scene3Loop');
  contentTrack.classList.add('is-moving');
  contentTrack.style.transition = 'transform 900ms var(--ease-cinema)';
  contentTrack.style.transform = 'translateX(-200vw)';

  setTimeout(() => {
    if (revision !== sceneRevision) return;
    setPhase('scene3-idle');
    contentTrack.classList.remove('is-moving');
    isLocked = false;
    window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 3 } }));
  }, 920);
};

const navigateSceneByDirection = (direction) => {
  if (isIntroActive) return;
  if (document.body.classList.contains('project-detail-open')) return;
  if (isScene2Leaving) return;

  if (direction === 'next') {
    if (phase === 'scene1-idle') goScene2();
    else if (phase === 'scene2-intro') skipScene2AndGoScene3();
    else if (phase === 'scene2-idle') startScene2ExitToScene3();
    else if (phase === 'scene3-idle') goScene4();
    return;
  }

  if (phase === 'scene4-idle') goBackToScene3();
  else if (phase === 'scene3-idle') goBackToScene2();
  else if (phase === 'scene2-intro') skipScene2AndGoScene1();
  else if (phase === 'scene2-idle') goScene1();
};

const handleWheel = (event) => {
  event.preventDefault();
  if (isIntroActive) return;
  if (document.body.classList.contains('project-detail-open')) return;
  if (isScene2Leaving) return;

  if (phase === 'scene2-intro' && Math.abs(event.deltaY) > 18) {
    if (event.deltaY > 0) skipScene2AndGoScene3();
    else skipScene2AndGoScene1();
    return;
  }

  const now = Date.now();
  if (now - lastWheelAt < 700) return;
  lastWheelAt = now;

  if (phase === 'scene4-idle') {
    if (event.deltaY < -18) goBackToScene3();
    return;
  }

  // Scene3 area-based routing
  if (phase === 'scene3-idle') {
    if (event.deltaY < -18) {
      goBackToScene2();
      return;
    }

    if (event.deltaY > 18) {
      goScene4();
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Photo interaction area: 30-70vw 脳 20-80vh
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

    return;
  }

  if (event.deltaY > 18) {
    if (phase === 'scene1-idle') goScene2();
    else if (phase === 'scene2-idle') startScene2ExitToScene3();
  }
  if (event.deltaY < -18) {
    if (phase === 'scene2-idle' || phase === 'scene2-intro') goScene1();
  }
};

const handleTouchStart = (event) => {
  if (!isMobileViewport()) return;
  if (isIntroActive) return;
  if (document.body.classList.contains('project-detail-open')) return;
  if (event.target.closest(INTERACTIVE_TOUCH_SELECTOR)) return;
  if (event.target.closest('.project-cards-grid')?.scrollHeight > scene2Cards.clientHeight + 2) return;

  isTouching = true;
  touchStartY = event.touches[0].clientY;
  touchStartX = event.touches[0].clientX;
};

const handleTouchMove = (event) => {
  if (!isMobileViewport()) return;
  if (!isTouching) return;
  if (event.touches.length !== 1) return;

  const currentY = event.touches[0].clientY;
  const currentX = event.touches[0].clientX;
  const deltaY = currentY - touchStartY;
  const deltaX = currentX - touchStartX;

  if (Math.abs(deltaY) >= Math.abs(deltaX)) {
    event.preventDefault();
  }
};

const handleTouchEnd = (event) => {
  if (!isMobileViewport()) return;
  if (!isTouching) return;
  isTouching = false;
  if (isIntroActive) return;
  if (document.body.classList.contains('project-detail-open')) return;
  if (isScene2Leaving) return;

  const endY = event.changedTouches[0].clientY;
  const endX = event.changedTouches[0].clientX;
  const deltaY = touchStartY - endY;
  const deltaX = touchStartX - endX;

  if (Math.abs(deltaY) < TOUCH_THRESHOLD || Math.abs(deltaY) < Math.abs(deltaX)) return;

  const now = Date.now();
  if (now - lastTouchAt < TOUCH_THROTTLE_MS) return;
  lastTouchAt = now;

  navigateSceneByDirection(deltaY > 0 ? 'next' : 'prev');
};

const warmUpAutoplay = () => {
  Object.values(videos).forEach(video => {
    video.muted = true;
    video.playsInline = true;
  });
  videos.scene1.pause();

  // Initialize scene3 video
  if (videos.scene3) {
    videos.scene3.currentTime = 0;
    videos.scene3.pause();
  }
  if (videos.scene3Loop) {
    videos.scene3Loop.currentTime = 0;
    videos.scene3Loop.pause();
  }
};

Object.entries(videos).forEach(([key, video]) => {
  let stallTimer;
  const clearStall = () => clearTimeout(stallTimer);
  const recover = () => {
    if (desiredBackground !== key || document.hidden) return;
    cancelBackgroundPlayback();
    showPoster(key);
    showOnly([]);
    pauseExcept([]);
    if (key === 'scene2' && phase === 'scene2-intro') finishScene2Intro();
  };
  video.addEventListener('error', recover);
  video.addEventListener('waiting', () => {
    clearStall();
    stallTimer = window.setTimeout(() => {
      if (video.readyState < 3) recover();
    }, VIDEO_START_TIMEOUT);
  });
  video.addEventListener('playing', clearStall);
  video.addEventListener('pause', clearStall);
});

let resumeAudioOnVisible = false;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    resumeAudioOnVisible = Boolean(window.audioControllerInstance?.isPlaying);
    window.audioControllerInstance?.pause();
    cancelBackgroundPlayback();
    pauseExcept([]);
    return;
  }
  if (!isIntroActive && desiredBackground) void activateBackground(desiredBackground);
  if (resumeAudioOnVisible) void window.audioControllerInstance?.play();
  resumeAudioOnVisible = false;
});

introEnterBtn.addEventListener('click', handleEnter);
enterBtn.addEventListener('click', goScene2);
window.addEventListener('wheel', handleWheel, { passive: false });
siteShell?.addEventListener('touchstart', handleTouchStart, { passive: true });
siteShell?.addEventListener('touchmove', handleTouchMove, { passive: false });
siteShell?.addEventListener('touchend', handleTouchEnd, { passive: true });
siteShell?.addEventListener('touchcancel', () => { isTouching = false; }, { passive: true });
scene2Cards?.addEventListener('touchstart', (event) => {
  if (!isMobileViewport() || event.touches.length !== 1) return;
  projectGridTouchY = event.touches[0].clientY;
  projectGridScrollTop = scene2Cards.scrollTop;
}, { passive: true });
scene2Cards?.addEventListener('touchmove', (event) => {
  if (!isMobileViewport() || event.touches.length !== 1) return;
  if (scene2Cards.scrollHeight <= scene2Cards.clientHeight + 2) return;
  event.preventDefault();
  event.stopPropagation();
  scene2Cards.scrollTop = projectGridScrollTop + projectGridTouchY - event.touches[0].clientY;
}, { passive: false });
window.addEventListener('resize', updateAppHeight);
window.visualViewport?.addEventListener('resize', updateAppHeight);
window.visualViewport?.addEventListener('scroll', updateAppHeight);
updateAppHeight();

mobilePrevBtn?.addEventListener('click', () => navigateSceneByDirection('prev'));
mobileNextBtn?.addEventListener('click', () => navigateSceneByDirection('next'));

document.querySelector('[data-go="scene1"]').addEventListener('click', goScene1);
document.querySelector('[data-go="scene2"]').addEventListener('click', goScene2);
document.querySelector('[data-go="scene3"]').addEventListener('click', () => {
  if (phase === 'scene4-idle') goBackToScene3();
});
document.querySelector('[data-go="scene4"]').addEventListener('click', goScene4);

feedbackForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();

  const form = event.currentTarget;
  const formData = new FormData(form);

  if (feedbackSubmit) {
    feedbackSubmit.disabled = true;
    feedbackSubmit.textContent = 'Sending... / 鍙戦€佷腑...';
  }
  if (feedbackToast) feedbackToast.textContent = '';

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      form.reset();
      if (feedbackToast) feedbackToast.textContent = 'Thanks for your feedback / 鎰熻阿浣犵殑鍙嶉';
    } else if (feedbackToast) {
      feedbackToast.textContent = 'Something went wrong. Please try again. / 鎻愪氦澶辫触锛岃绋嶅悗閲嶈瘯';
    }
  } catch (error) {
    if (feedbackToast) {
      feedbackToast.textContent = 'Something went wrong. Please try again. / 鎻愪氦澶辫触锛岃绋嶅悗閲嶈瘯';
    }
  } finally {
    if (feedbackSubmit) {
      feedbackSubmit.disabled = false;
      feedbackSubmit.textContent = 'Submit / 鎻愪氦';
    }
  }
}, { capture: true });

readMetadata();
document.body.dataset.phase = 'scene1';
setPhase('scene1-idle');
showOnly(['scene1']);
warmUpAutoplay();
videos.transition.addEventListener('timeupdate', frameLoop);
videos.scene2.addEventListener('timeupdate', frameLoop);
