// ============================================
// Gallery 3D Photo Stream System
// ============================================

// Throttle helper
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
  { id: 1, src: 'assets/gallery/photo1.jpg', title: '废墟中的生机', description: '后末日城市中，自然重新占领了曾经的工业遗迹。', date: '2026.06', initialZ: -800, direction: 1 },
  { id: 2, src: 'assets/gallery/photo2.jpg', title: '霓虹幻影', description: '破碎的广告牌依然闪烁着过去的繁华。', date: '2026.05', initialZ: -600, direction: 1 },
  { id: 3, src: 'assets/gallery/photo3.jpg', title: '钢铁森林', description: '高楼的骨架在雾中若隐若现。', date: '2026.04', initialZ: -400, direction: -1 },
  { id: 4, src: 'assets/gallery/photo4.jpg', title: '遗忘之地', description: '曾经的地铁站台，现在只有沉默。', date: '2026.03', initialZ: -200, direction: 1 },
  { id: 5, src: 'assets/gallery/photo5.jpg', title: '旧日回声', description: '破旧的留声机旁，照片记录着故事。', date: '2026.02', initialZ: 0, direction: -1 },
  { id: 6, src: 'assets/gallery/photo6.jpg', title: '暮色余晖', description: '落日穿过废墟的缝隙，投下长长的影子。', date: '2026.01', initialZ: 200, direction: 1 },
  { id: 7, src: 'assets/gallery/photo7.jpg', title: '静默守望', description: '锈蚀的机器人依然站立在原地。', date: '2025.12', initialZ: -700, direction: -1 },
  { id: 8, src: 'assets/gallery/photo8.jpg', title: '碎片时光', description: '散落的记忆碎片拼凑不出完整的过去。', date: '2025.11', initialZ: -500, direction: 1 },
  { id: 9, src: 'assets/gallery/photo9.jpg', title: '风沙过境', description: '沙尘暴席卷过后，一切归于平静。', date: '2025.10', initialZ: -300, direction: -1 },
  { id: 10, src: 'assets/gallery/photo10.jpg', title: '最后的信号', description: '信号塔顶端的红灯还在闪烁。', date: '2025.09', initialZ: -100, direction: 1 },
  { id: 11, src: 'assets/gallery/photo11.jpg', title: '荒原之路', description: '公路延伸向远方，不知通往何处。', date: '2025.08', initialZ: 100, direction: -1 },
  { id: 12, src: 'assets/gallery/photo12.jpg', title: '重生之芽', description: '裂缝中长出的新绿，是希望的颜色。', date: '2025.07', initialZ: 300, direction: 1 }
];

const Z_MIN = -1000;
const Z_MAX = 400;
const FLOW_SPEED = 0.5; // px per frame at 60fps
const SCROLL_DELTA = 80; // px per wheel event

let photoElements = [];
let rafId = null;
let isPaused = false;
let manualScrollDelta = 0;

function createPhotoElements() {
  const track = document.getElementById('photoTrack');
  if (!track) return;

  track.innerHTML = '';
  photoElements = [];

  PHOTOS.forEach(photo => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.dataset.photoId = photo.id;
    card.dataset.direction = photo.direction;

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.title;
    img.loading = 'lazy';

    card.appendChild(img);
    track.appendChild(card);

    // Click to focus
    card.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('gallery:focus', {
        detail: { photoId: photo.id }
      }));
    });

    photoElements.push({
      element: card,
      data: photo,
      currentZ: photo.initialZ
    });
  });
}

function updatePhotoPositions(deltaZ = 0) {
  photoElements.forEach(photo => {
    const direction = parseFloat(photo.data.direction);

    // Update Z position
    if (!isPaused) {
      photo.currentZ += FLOW_SPEED * direction;
    }

    // Manual scroll control
    photo.currentZ -= deltaZ;

    // Z-axis looping
    if (photo.currentZ < Z_MIN) {
      photo.currentZ = Z_MAX;
    } else if (photo.currentZ > Z_MAX) {
      photo.currentZ = Z_MIN;
    }

    // Apply transform
    const translateZ = photo.currentZ;
    const scale = 1 + (photo.currentZ / 1000); // Subtle scale based on depth
    photo.element.style.transform = `translateZ(${translateZ}px) scale(${scale})`;

    // Depth blur
    const blurAmount = Math.abs(photo.currentZ) / 100;
    photo.element.style.filter = `blur(${blurAmount}px)`;

    // Opacity based on distance
    const opacity = photo.currentZ > -800 && photo.currentZ < 300 ? 1 : 0;
    photo.element.style.opacity = opacity;
  });

  // Reset manual scroll
  manualScrollDelta = 0;
}

function startPhotoLoop() {
  function animate() {
    updatePhotoPositions(manualScrollDelta);
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

window.addEventListener('gallery:wheel', (e) => {
  const delta = e.detail.deltaY;
  manualScrollDelta = delta > 0 ? SCROLL_DELTA : -SCROLL_DELTA;
});

const handleMouseMove = throttle((e) => {
  const track = document.getElementById('photoTrack');
  if (!track) return;

  const cards = track.querySelectorAll('.photo-card');
  let hoveredCard = null;

  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const isHovered = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );

    if (isHovered) {
      card.classList.add('is-hovered');
      hoveredCard = card;
      isPaused = true;
    } else {
      card.classList.remove('is-hovered');
    }
  });

  if (!hoveredCard) {
    isPaused = false;
  }
}, 100); // 100ms throttle

document.addEventListener('mousemove', handleMouseMove);

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  createPhotoElements();

  // Start loop when scene3 becomes active
  window.addEventListener('scene:change', (e) => {
    if (e.detail.scene === 3) {
      startPhotoLoop();
    } else {
      stopPhotoLoop();
    }
  });
});

// Export for gallery-focus.js
window.gallerySystem = {
  getPhotoById: (id) => PHOTOS.find(p => p.id === id),
  getAllPhotos: () => PHOTOS,
  pause: () => { isPaused = true; },
  resume: () => { isPaused = false; }
};
