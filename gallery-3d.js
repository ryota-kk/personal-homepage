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
  { id: 1, src: 'assets/gallery/photo1.jpg', title: '日照雅拉', description: '晨光掠过雪峰，远行的人在山脊上写下微小的勇敢。', date: '2026.06', column: 'left' },
  { id: 2, src: 'assets/gallery/photo2.jpg', title: '云雾川西', description: '云雾漫过群山，少年站在风里，把川西的冷冽收藏进眼底。', date: '2026.05', column: 'right' },
  { id: 3, src: 'assets/gallery/photo3.jpg', title: '厦门海边', description: '海风从桥下吹来，花束遮住面庞，也遮不住奔向自由的心情。', date: '2026.04', column: 'left' },
  { id: 4, src: 'assets/gallery/photo4.jpg', title: '稻城亚丁', description: '山谷辽阔，雪峰沉默，脚下的路通向更远的自己。', date: '2026.03', column: 'right' },
  { id: 5, src: 'assets/gallery/photo5.jpg', title: '墨石公园', description: '灰白山岩如异星荒原，人在其中短暂停留，像一场清醒的梦。', date: '2026.02', column: 'left' },
  { id: 6, src: 'assets/gallery/photo6.jpg', title: '山城步道', description: '江风穿过城市天际，手中一把折扇，展开山城的夏日记忆。', date: '2026.01', column: 'right' },
  { id: 7, src: 'assets/gallery/photo7.jpg', title: '油菜花海', description: '金色花浪漫过春天，笑声落在风里，像阳光一样明亮。', date: '2025.12', column: 'left' },
  { id: 8, src: 'assets/gallery/photo8.jpg', title: '湘江北去', description: '伟岸石像望向远方，湘江水声未歇，少年也在时间里向前。', date: '2025.11', column: 'right' },
  { id: 9, src: 'assets/gallery/photo9.jpg', title: '洪崖洞', description: '灯火沿着吊脚楼层层亮起，夜色里的山城像一场热闹的梦。', date: '2025.10', column: 'left' },
  { id: 10, src: 'assets/gallery/photo10.jpg', title: '日落与海', description: '暮色沉入海面，浪声轻轻靠岸，把一天的疲惫都交给黄昏。', date: '2025.09', column: 'right' },
  { id: 11, src: 'assets/gallery/photo11.jpg', title: '一路向海', description: '车轮贴着海风前行，椰影、白沙和远方一起落进夏天。', date: '2025.08', column: 'left' },
  { id: 12, src: 'assets/gallery/photo12.jpg', title: '普洱茶香', description: '灯影温柔，花香与茶香慢慢散开，时光在一盏清茶里安静下来。', date: '2025.07', column: 'right' }
].map(photo => ({
  ...photo,
  src: `assets/gallery/previews/photo${photo.id}-desktop.webp`,
  mobileSrc: `assets/gallery/previews/photo${photo.id}-mobile.webp`,
}));

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
  img.src = `assets/gallery/thumbs/photo${photo.id}.jpg`;
  img.alt = photo.title;
  img.className = 'photo-image';
  img.loading = 'lazy';
  img.decoding = 'async';

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
  if (rafId || document.hidden) return;

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
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopPhotoLoop();
    else if (document.body.dataset.phase === 'scene3') startPhotoLoop();
  });

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
    stopPhotoLoop();
    pausedColumns.left = true;
    pausedColumns.right = true;
  },
  resume: () => {
    pausedColumns.left = false;
    pausedColumns.right = false;
    if (document.body.dataset.phase === 'scene3') startPhotoLoop();
  }
};
