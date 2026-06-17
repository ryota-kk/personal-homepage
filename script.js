const videos = {
  scene1: document.getElementById('scene1Video'),
  transition: document.getElementById('transitionVideo'),
  scene2: document.getElementById('scene2Video'),
  scene2Idle: document.getElementById('scene2IdleVideo'),
  scene3: document.getElementById('scene3Video'),
  scene3Loop: document.getElementById('scene3LoopVideo'),
};

const contentTrack = document.getElementById('contentTrack');
const introOverlay = document.getElementById('introOverlay');
const introEnterBtn = document.getElementById('introEnterBtn');
const introAudio = document.getElementById('introAudio');
const enterBtn = document.getElementById('enterBtn');
const progressBar = document.getElementById('progressBar');
const stateText = document.getElementById('stateText');
const navDots = [...document.querySelectorAll('.nav-dot')];
const scene2Cards = document.querySelector('.content-grid');
const feedbackForm = document.getElementById('feedbackForm');
const feedbackToast = document.getElementById('feedbackToast');
const feedbackSubmit = feedbackForm?.querySelector('.feedback-submit');
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xeewdkap";

let isIntroActive = true;
let phase = 'scene1-idle';
let isLocked = false;
let transitionDuration = 8.833;
let scene2Duration = 8.767;
let scene2IdleStarted = false;
let lastWheelAt = 0;
let touchStartY = 0;
let scene2SkipStarted = false;
let scene3LoopStarted = false;
let isScene2Leaving = false;
let scene2ExitTimer = null;
const scene2ExitDelay = 320;

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
    const isVisible = visibleKeys.includes(key);
    if (!isVisible && key === 'scene1') video.style.opacity = '';
    video.classList.toggle('is-visible', isVisible);
  });
};

const safePlay = (video) => {
  const promise = video.play();
  if (promise && typeof promise.catch === 'function') {
    promise.catch(() => {});
  }
};

const waitForVideoReady = (video) => new Promise(resolve => {
  if (video.readyState >= 2) {
    resolve();
    return;
  }

  const done = () => {
    video.removeEventListener('loadeddata', done);
    video.removeEventListener('canplay', done);
    video.removeEventListener('error', done);
    resolve();
  };

  video.addEventListener('loadeddata', done, { once: true });
  video.addEventListener('canplay', done, { once: true });
  video.addEventListener('error', done, { once: true });
  video.load();
});

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
  videos.scene3.onended = null;
  videos.scene3.pause();
  videos.scene3Loop.pause();
  videos.scene3.currentTime = 0;
  videos.scene3Loop.currentTime = 0;
  videos.scene3.style.transition = '';
  videos.scene3Loop.style.transition = '';
  videos.scene3.style.opacity = '0';
  videos.scene3Loop.style.opacity = '0';
  videos.scene3Loop.classList.remove('is-visible');
};

const playScene3Loop = () => {
  if (scene3LoopStarted) return;

  scene3LoopStarted = true;
  videos.scene3Loop.currentTime = 0;
  videos.scene3Loop.style.transition = 'opacity 420ms ease';
  videos.scene3.style.transition = 'opacity 420ms ease';
  videos.scene3Loop.classList.add('is-visible');
  safePlay(videos.scene3Loop);

  requestAnimationFrame(() => {
    videos.scene3Loop.style.opacity = '1';
    videos.scene3.style.opacity = '0';
  });

  window.setTimeout(() => {
    if (scene3LoopStarted) videos.scene3.pause();
  }, 460);
};

const playScene3Intro = async ({ holdVisibleKeys = [] } = {}) => {
  resetScene3Videos();
  videos.scene3.currentTime = 0;
  videos.scene3Loop.load();
  await waitForVideoReady(videos.scene3);

  showOnly([...holdVisibleKeys, 'scene3']);
  videos.scene3.onended = playScene3Loop;
  safePlay(videos.scene3);

  requestAnimationFrame(() => {
    videos.scene3.style.transition = 'opacity 0.8s ease';
    videos.scene3.style.opacity = '1';
  });

  if (holdVisibleKeys.length > 0) {
    window.setTimeout(() => {
      showOnly(['scene3']);
      holdVisibleKeys.forEach(key => {
        videos[key].pause();
      });
    }, 520);
  }
};

const handleEnter = async () => {
  if (!isIntroActive) return;

  // 馃幍 瑙﹀彂闊抽鎾斁
  if (window.audioControllerInstance) {
    try {
      await window.audioControllerInstance.play();
    } catch (error) {
      console.warn('闊抽鑷姩鎾斁澶辫触锛堟祻瑙堝櫒绛栫暐锛?', error);
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
  scene2SkipStarted = false;
  resetProgress();

  videos.scene1.style.opacity = '';
  contentTrack.classList.add('is-moving');
  setPhase('transition');
  showOnly(['transition']);
  pauseExcept(['transition']);

  videos.transition.currentTime = 0;
  safePlay(videos.transition);

  // Start scene2 when the transition video ends.
  videos.transition.addEventListener('ended', () => {
    videos.scene2.style.transition = '';
    videos.scene2.style.opacity = '1';
    showOnly(['scene2']);
    pauseExcept(['scene2']);

    videos.scene2.currentTime = 0;
    setPhase('scene2-intro');
    safePlay(videos.scene2);
  }, { once: true });
};

const goScene1 = ({ force = false } = {}) => {
  if (!force && (isLocked || phase === 'transition')) return;
  isLocked = true;
  scene2IdleStarted = true;
  resetScene2Exit();

  contentTrack.classList.add('is-moving');
  contentTrack.style.transition = 'transform 520ms var(--ease-cinema)';
  contentTrack.style.transform = 'translate3d(0,0,0)';

  videos.transition.pause();
  videos.scene2.pause();
  videos.scene2Idle.pause();
  videos.transition.currentTime = 0;
  videos.scene2.currentTime = 0;
  videos.scene2Idle.currentTime = 0;
  videos.transition.style.opacity = '0';
  videos.scene2.style.opacity = '0';
  videos.scene2Idle.style.opacity = '0';
  videos.scene2.style.transition = '';
  videos.scene2Idle.style.transition = '';
  videos.scene1.style.opacity = '1';
  showOnly(['scene1']);
  pauseExcept(['scene1']);
  videos.scene1.currentTime = 0;
  safePlay(videos.scene1);

  document.body.dataset.phase = 'scene1';
  setTimeout(() => {
    contentTrack.classList.remove('is-moving');
    contentTrack.style.transition = '';
    contentTrack.style.transform = '';
    videos.transition.style.opacity = '';
    videos.scene2.style.opacity = '';
    videos.scene2Idle.style.opacity = '';
    videos.scene1.style.opacity = '';
    setPhase('scene1-idle');
    resetProgress();
    isLocked = false;
    scene2SkipStarted = false;

    // Notify systems of scene change
    window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 1 } }));
  }, 560);
};

const goScene3 = ({ skipScene2Intro = false, fromScene2Exit = false } = {}) => {
  const canEnterFromScene2Intro = skipScene2Intro && phase === 'scene2-intro';
  if (scene2SkipStarted || (!canEnterFromScene2Intro && (isLocked || phase !== 'scene2-idle'))) return;

  if (canEnterFromScene2Intro) {
    scene2SkipStarted = true;
    scene2IdleStarted = true;
  }

  isLocked = true;
  contentTrack.classList.add('is-moving');
  contentTrack.style.transform = 'translateX(-100vw)';
  setPhase('transition-2-3');

  const outgoingKey = canEnterFromScene2Intro ? 'scene2' : 'scene2Idle';
  videos[outgoingKey].style.transition = '';
  videos[outgoingKey].style.opacity = '1';

  setTimeout(async () => {
    showOnly([outgoingKey]);

    // Fade in scene3 intro first; keep scene2 visible until scene3 is on screen.
    await playScene3Intro({ holdVisibleKeys: [outgoingKey] });

    // Scroll to scene3
    contentTrack.style.transition = `transform ${transitionDuration * 1000}ms var(--ease-cinema)`;
    contentTrack.style.transform = 'translateX(-200vw)';

    setTimeout(() => {
      phase = 'scene3-idle';
      isLocked = false;
      updateDots('scene3');
      scene2SkipStarted = false;
      resetScene2Exit({ clearTimer: false });

      // Notify gallery system
      window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 3 } }));
    }, transitionDuration * 1000);

  }, fromScene2Exit ? 0 : (canEnterFromScene2Intro ? 120 : 800));
};

const startScene2ExitToScene3 = ({ skipScene2Intro = false } = {}) => {
  if (isScene2Leaving || scene2SkipStarted) return;
  if (phase !== 'scene2-idle' && phase !== 'scene2-intro') return;

  isScene2Leaving = true;
  isLocked = true;
  scene2Cards?.classList.add('is-leaving');

  const visibleScene2Key = phase === 'scene2-idle' ? 'scene2Idle' : 'scene2';
  showOnly([visibleScene2Key]);
  safePlay(videos[visibleScene2Key]);

  scene2ExitTimer = window.setTimeout(() => {
    scene2ExitTimer = null;
    const shouldSkipIntro = skipScene2Intro && phase === 'scene2-intro';
    if (!shouldSkipIntro) isLocked = false;
    if (phase === 'scene2-intro') progressBar.style.width = '100%';
    goScene3({ skipScene2Intro: shouldSkipIntro, fromScene2Exit: true });
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
  isLocked = true;
  resetScene2Exit();

  // Fade out scene3
  videos.scene3.style.transition = 'opacity 0.8s ease';
  videos.scene3Loop.style.transition = 'opacity 0.8s ease';
  videos.scene3.style.opacity = '0';
  videos.scene3Loop.style.opacity = '0';

  setTimeout(() => {
    resetScene3Videos();

    // Fade in scene2
    showOnly(['scene2Idle']);
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

const goScene4 = () => {
  if (isLocked || phase !== 'scene3-idle') return;
  isLocked = true;
  setPhase('transition-3-4');
  contentTrack.classList.add('is-moving');
  contentTrack.style.transition = 'transform 900ms var(--ease-cinema)';
  contentTrack.style.transform = 'translateX(-300vw)';

  setTimeout(() => {
    setPhase('scene4-idle');
    progressBar.style.width = '100%';
    isLocked = false;
    window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 4 } }));
  }, 920);
};

const goBackToScene3 = () => {
  if (isLocked || phase !== 'scene4-idle') return;
  isLocked = true;
  setPhase('transition-4-3');
  contentTrack.classList.add('is-moving');
  contentTrack.style.transition = 'transform 900ms var(--ease-cinema)';
  contentTrack.style.transform = 'translateX(-200vw)';

  setTimeout(() => {
    setPhase('scene3-idle');
    isLocked = false;
    window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 3 } }));
  }, 920);
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
  if (isIntroActive) return;
  if (document.body.classList.contains('project-detail-open')) return;
  touchStartY = event.touches[0].clientY;
};

const handleTouchEnd = (event) => {
  if (isIntroActive) return;
  if (document.body.classList.contains('project-detail-open')) return;
  if (isScene2Leaving) return;
  const endY = event.changedTouches[0].clientY;
  const delta = touchStartY - endY;
  if (Math.abs(delta) < 42) return;
  if (phase === 'scene4-idle') {
    if (delta < 0) goBackToScene3();
    return;
  }
  if (phase === 'scene3-idle') {
    if (delta > 0) goScene4();
    else goBackToScene2();
    return;
  }
  if (phase === 'scene2-intro') {
    if (delta > 0) skipScene2AndGoScene3();
    else skipScene2AndGoScene1();
    return;
  }
  if (delta > 0) {
    if (phase === 'scene2-idle') startScene2ExitToScene3();
    else goScene2();
  }
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
  if (videos.scene3Loop) {
    videos.scene3Loop.currentTime = 0;
    videos.scene3Loop.pause();
  }
};

introEnterBtn.addEventListener('click', handleEnter);
enterBtn.addEventListener('click', goScene2);
window.addEventListener('wheel', handleWheel, { passive: false });
window.addEventListener('touchstart', handleTouchStart, { passive: true });
window.addEventListener('touchend', handleTouchEnd, { passive: true });

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

readMetadata().then(() => {
  document.body.dataset.phase = 'scene1';
  setPhase('scene1-idle');
  showOnly(['scene1']);
  warmUpAutoplay();
  frameLoop();
});
