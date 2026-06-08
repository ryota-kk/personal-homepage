// ============================================
// Gallery 3D Photo Stream System
// ============================================

function throttle(fn, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

const PHOTOS = [
  { id: 1, src: 'assets/gallery/photo1.jpg', title: '废墟中的生机', description: '后末日城市中，自然重新占领了曾经的工业遗迹。', date: '2026.06', column: 'left' },
  { id: 2, src: 'assets/gallery/photo2.jpg', title: '霓虹幻影', description: '破碎的广告牌依然闪烁着过去的繁华。', date: '2026.05', column: 'right' },
  { id: 3, src: 'assets/gallery/photo3.jpg', title: '钢铁森林', description: '高楼的骨架在雾中若隐若现。', date: '2026.04', column: 'left' },
  { id: 4, src: 'assets/gallery/photo4.jpg', title: '遗忘之地', description: '曾经的地铁站台，现在只有沉默。', date: '2026.03', column: 'right' },
  { id: 5, src: 'assets/gallery/photo5.jpg', title: '旧日回声', description: '破旧的留声机旁，照片记录着故事。', date: '2026.02', column: 'left' },
  { id: 6, src: 'assets/gallery/photo6.jpg', title: '暮色余晖', description: '落日穿过废墟的缝隙，投下长长的影子。', date: '2026.01', column: 'right' },
  { id: 7, src: 'assets/gallery/photo7.jpg', title: '静默守望', description: '锈蚀的机器人依然站立在原地。', date: '2025.12', column: 'left' },
  { id: 8, src: 'assets/gallery/photo8.jpg', title: '碎片时光', description: '散落的记忆碎片拼凑不出完整的过去。', date: '2025.11', column: 'right' },
  { id: 9, src: 'assets/gallery/photo9.jpg', title: '风沙过境', description: '沙尘暴中卷过后，一切归于平静。', date: '2025.10', column: 'left' },
  { id: 10, src: 'assets/gallery/photo10.jpg', title: '最后的信号', description: '信号塔顶端的红灯还在闪烁。', date: '2025.09', column: 'right' },
  { id: 11, src: 'assets/gallery/photo11.jpg', title: '荒原之路', description: '公路延伸向远方，不知通往何处。', date: '2025.08', column: 'left' },
  { id: 12, src: 'assets/gallery/photo12.jpg', title: '重生之芽', description: '裂缝中长出的新绿，是希望的颜色。', date: '2025.07', column: 'right' }
];

const SCROLL_SPEED = 0.3;
const CARD_HEIGHT = 220;
const CARD_GAP = 30;
const TRACK_HEIGHT_FALLBACK = (CARD_HEIGHT + CARD_GAP) * 6;

let photoElements = [];
let trackState = null;
let rafId = null;
let pausedColumns = { left: false, right: false }; // 分列暂停状态
let hoverWatcherBound = false;

function createPhotoCard(photo) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.dataset.photoId = photo.id;

  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = photo.title;
  img.className = 'photo-image';

  const shineOverlay = document.createElement('div');
  shineOverlay.className = 'shine-overlay';

  const infoOverlay = document.createElement('div');
  infoOverlay.className = 'photo-info-overlay';
  infoOverlay.innerHTML = `
    <div class="photo-title">${photo.title}</div>
    <div class="photo-date">${photo.date}</div>
  `;

  card.appendChild(img);
  card.appendChild(shineOverlay);
  card.appendChild(infoOverlay);

  photoElements.push({
    element: card,
    img,
    shineOverlay,
    infoOverlay,
    data: photo
  });

  return card;
}

function createTrackStrip(photos) {
  const strip = document.createElement('div');
  strip.className = 'photo-track-strip';

  for (let setIndex = 0; setIndex < 2; setIndex++) {
    photos.forEach(photo => {
      const card = createPhotoCard(photo);
      card.dataset.cloneSet = String(setIndex);
      strip.appendChild(card);
    });
  }

  return strip;
}

function createPhotoElements() {
  const leftColumn = document.getElementById('photoColumnLeft');
  const rightColumn = document.getElementById('photoColumnRight');

  if (!leftColumn || !rightColumn) return;

  leftColumn.innerHTML = '';
  rightColumn.innerHTML = '';
  photoElements = [];

  const leftPhotos = PHOTOS.filter(photo => photo.column === 'left');
  const rightPhotos = PHOTOS.filter(photo => photo.column === 'right');
  const leftStrip = createTrackStrip(leftPhotos);
  const rightStrip = createTrackStrip(rightPhotos);

  leftColumn.appendChild(leftStrip);
  rightColumn.appendChild(rightStrip);

  const leftTrackHeight = getTrackHeight(leftStrip);
  const rightTrackHeight = getTrackHeight(rightStrip);

  trackState = {
    left: {
      element: leftStrip,
      offset: 0,
      direction: -1,
      height: leftTrackHeight
    },
    right: {
      element: rightStrip,
      offset: -rightTrackHeight,
      direction: 1,
      height: rightTrackHeight
    }
  };

  setupCardHoverEffects();
  updatePhotoPositions();
}

function getTrackHeight(strip) {
  return strip.scrollHeight / 2 || TRACK_HEIGHT_FALLBACK;
}

function syncTrackHeights() {
  if (!trackState) return;

  Object.values(trackState).forEach(track => {
    track.height = getTrackHeight(track.element);
    normalizeTrackOffset(track);
    track.element.style.transform = `translateY(${track.offset}px)`;
  });
}

function normalizeTrackOffset(track) {
  if (track.direction < 0 && track.offset <= -track.height) {
    track.offset += track.height;
  }

  if (track.direction > 0 && track.offset >= 0) {
    track.offset -= track.height;
  }
}

function updatePhotoPositions() {
  if (!trackState) return;

  Object.entries(trackState).forEach(([columnName, track]) => {
    // 检查该列是否被暂停
    if (pausedColumns[columnName]) return;

    track.offset += SCROLL_SPEED * track.direction;
    normalizeTrackOffset(track);
    track.element.style.transform = `translateY(${track.offset}px)`;
  });
}

function startPhotoLoop() {
  if (rafId) return;

  function animate() {
    updatePhotoPositions();
    rafId = requestAnimationFrame(animate);
  }

  rafId = requestAnimationFrame(animate);
}

function stopPhotoLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function setupCardHoverEffects() {
  photoElements.forEach(item => {
    const { element, img, shineOverlay, infoOverlay, data } = item;

    element.addEventListener('mouseenter', () => {
      // 只暂停该照片所属的列
      pausedColumns[data.column] = true;
      element.classList.add('is-hovered');
    });

    element.addEventListener('mouseleave', () => {
      element.classList.remove('is-hovered');
      element.style.transform = '';
      img.style.transform = '';
      infoOverlay.style.transform = '';
      shineOverlay.style.setProperty('--mouse-x', '50%');
      shineOverlay.style.setProperty('--mouse-y', '50%');
    });

    element.addEventListener('mousemove', (event) => {
      if (!element.classList.contains('is-hovered')) return;

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const normalizedX = (x / rect.width) * 2 - 1;
      const normalizedY = (y / rect.height) * 2 - 1;
      const rotateY = normalizedX * 15;
      const rotateX = -normalizedY * 15;

      element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`;
      img.style.transform = 'translateZ(20px)';
      infoOverlay.style.transform = 'translateZ(50px)';
      shineOverlay.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      shineOverlay.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });

    element.addEventListener('click', () => {
      const photoId = parseInt(element.dataset.photoId, 10);
      window.dispatchEvent(new CustomEvent('gallery:focus', {
        detail: { photoId: photoId }
      }));
    });
  });

  if (hoverWatcherBound) return;
  hoverWatcherBound = true;

  // 监听全局鼠标移动，检测每列是否还有悬停的卡片
  document.addEventListener('mousemove', throttle(() => {
    ['left', 'right'].forEach(columnName => {
      const columnHasHover = photoElements.some(item =>
        item.data.column === columnName && item.element.classList.contains('is-hovered')
      );

      if (!columnHasHover && pausedColumns[columnName]) {
        pausedColumns[columnName] = false;
      }
    });
  }, 100));
}

document.addEventListener('DOMContentLoaded', () => {
  createPhotoElements();

  window.addEventListener('scene:change', (event) => {
    if (event.detail.scene === 3) {
      startPhotoLoop();
    } else {
      stopPhotoLoop();
    }
  });
});

window.gallerySystem = {
  getPhotoById: (id) => PHOTOS.find(photo => photo.id === id),
  getAllPhotos: () => PHOTOS,
  pause: () => {
    pausedColumns.left = true;
    pausedColumns.right = true;
  },
  resume: () => {
    pausedColumns.left = false;
    pausedColumns.right = false;
  }
};
