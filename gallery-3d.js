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
  { id: 1, src: 'assets/gallery/photo1.jpg', title: '废墟中的生机', description: '后末日城市中，自然重新占领了曾经的工业遗迹。', date: '2026.06', column: 'left', initialY: 0 },
  { id: 2, src: 'assets/gallery/photo2.jpg', title: '霓虹幻影', description: '破碎的广告牌依然闪烁着过去的繁华。', date: '2026.05', column: 'right', initialY: 0 },
  { id: 3, src: 'assets/gallery/photo3.jpg', title: '钢铁森林', description: '高楼的骨架在雾中若隐若现。', date: '2026.04', column: 'left', initialY: 250 },
  { id: 4, src: 'assets/gallery/photo4.jpg', title: '遗忘之地', description: '曾经的地铁站台，现在只有沉默。', date: '2026.03', column: 'right', initialY: 250 },
  { id: 5, src: 'assets/gallery/photo5.jpg', title: '旧日回声', description: '破旧的留声机旁，照片记录着故事。', date: '2026.02', column: 'left', initialY: 500 },
  { id: 6, src: 'assets/gallery/photo6.jpg', title: '暮色余晖', description: '落日穿过废墟的缝隙，投下长长的影子。', date: '2026.01', column: 'right', initialY: 500 },
  { id: 7, src: 'assets/gallery/photo7.jpg', title: '静默守望', description: '锈蚀的机器人依然站立在原地。', date: '2025.12', column: 'left', initialY: 750 },
  { id: 8, src: 'assets/gallery/photo8.jpg', title: '碎片时光', description: '散落的记忆碎片拼凑不出完整的过去。', date: '2025.11', column: 'right', initialY: 750 },
  { id: 9, src: 'assets/gallery/photo9.jpg', title: '风沙过境', description: '沙尘暴席卷过后，一切归于平静。', date: '2025.10', column: 'left', initialY: 1000 },
  { id: 10, src: 'assets/gallery/photo10.jpg', title: '最后的信号', description: '信号塔顶端的红灯还在闪烁。', date: '2025.09', column: 'right', initialY: 1000 },
  { id: 11, src: 'assets/gallery/photo11.jpg', title: '荒原之路', description: '公路延伸向远方，不知通往何处。', date: '2025.08', column: 'left', initialY: 1250 },
  { id: 12, src: 'assets/gallery/photo12.jpg', title: '重生之芽', description: '裂缝中长出的新绿，是希望的颜色。', date: '2025.07', column: 'right', initialY: 1250 }
];

const SCROLL_SPEED = 0.3; // px per frame at 60fps
const CARD_HEIGHT = 220;
const CARD_GAP = 30;
const TOTAL_HEIGHT = CARD_HEIGHT + CARD_GAP; // 250px per card

let photoElements = [];
let rafId = null;
let isPaused = false;

function createPhotoElements() {
  const leftColumn = document.getElementById('photoColumnLeft');
  const rightColumn = document.getElementById('photoColumnRight');

  if (!leftColumn || !rightColumn) return;

  leftColumn.innerHTML = '';
  rightColumn.innerHTML = '';
  photoElements = [];

  // 为每张照片创建 DOM 元素（原始 + 1 个克隆）
  PHOTOS.forEach(photo => {
    const targetColumn = photo.column === 'left' ? leftColumn : rightColumn;

    // 创建原始照片和克隆照片
    for (let clone = 0; clone < 2; clone++) {
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
      targetColumn.appendChild(card);

      // 计算初始位置：克隆在原始照片后方 1500px
      const totalScrollHeight = TOTAL_HEIGHT * 6; // 1500px
      const offsetY = clone * totalScrollHeight;

      photoElements.push({
        element: card,
        img: img,
        shineOverlay: shineOverlay,
        infoOverlay: infoOverlay,
        data: photo,
        currentY: photo.initialY + offsetY,
        isClone: clone === 1
      });
    }
  });

  setupCardHoverEffects();
}

function updatePhotoPositions() {
  const columnHeight = window.innerHeight * 0.8; // 80vh
  const totalScrollHeight = TOTAL_HEIGHT * 6; // 1500px (6 photos * 250px)

  photoElements.forEach(item => {
    const { element, data } = item;

    // 左列向上移动（负方向），右列向下移动（正方向）
    const direction = data.column === 'left' ? -1 : 1;
    item.currentY += SCROLL_SPEED * direction;

    // 无缝循环：当照片/克隆移出视口时，跳到另一端
    // 关键：因为有克隆在后方，所以跳跃发生时，用户看到的是克隆在继续移动
    if (data.column === 'left') {
      // 左列向上移动：当移出顶部时，跳到底部
      if (item.currentY < -CARD_HEIGHT) {
        item.currentY += totalScrollHeight;
      }
    } else {
      // 右列向下移动：当移出底部时，跳到顶部
      if (item.currentY > columnHeight) {
        item.currentY -= totalScrollHeight;
      }
    }

    // 应用 transform
    element.style.transform = `translateY(${item.currentY}px)`;
  });
}

function startPhotoLoop() {
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
    const { element, img, shineOverlay, infoOverlay } = item;

    element.addEventListener('mouseenter', () => {
      if (!isPaused) isPaused = true;
      element.classList.add('is-hovered');
    });

    element.addEventListener('mouseleave', () => {
      element.classList.remove('is-hovered');
      // 重置所有元素的变换
      element.style.transform = `translateY(${item.currentY}px)`;
      img.style.transform = '';
      infoOverlay.style.transform = '';
      shineOverlay.style.setProperty('--mouse-x', '50%');
      shineOverlay.style.setProperty('--mouse-y', '50%');
    });

    element.addEventListener('mousemove', (e) => {
      if (!element.classList.contains('is-hovered')) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 归一化到 -1 到 1
      const normalizedX = (x / rect.width) * 2 - 1;
      const normalizedY = (y / rect.height) * 2 - 1;

      // 计算旋转角度（最大 15 度）
      const rotateY = normalizedX * 15;
      const rotateX = -normalizedY * 15;

      // 应用 3D 变换到卡片容器
      element.style.transform = `translateY(${item.currentY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`;

      // 分层效果：图片轻微提升
      img.style.transform = `translateZ(20px)`;

      // 分层效果：信息层更高
      infoOverlay.style.transform = `translateZ(50px)`;

      // 更新光泽位置
      const mouseXPercent = (x / rect.width) * 100;
      const mouseYPercent = (y / rect.height) * 100;
      shineOverlay.style.setProperty('--mouse-x', `${mouseXPercent}%`);
      shineOverlay.style.setProperty('--mouse-y', `${mouseYPercent}%`);
    });

    // Click to focus
    element.addEventListener('click', () => {
      const photoData = PHOTOS.find(p => p.id === parseInt(element.dataset.photoId));
      document.dispatchEvent(new CustomEvent('gallery:focus', {
        detail: photoData
      }));
    });
  });

  // 检测鼠标是否离开所有照片区域
  document.addEventListener('mousemove', throttle((e) => {
    const anyHovered = photoElements.some(item =>
      item.element.classList.contains('is-hovered')
    );
    if (!anyHovered && isPaused) {
      isPaused = false;
    }
  }, 100));
}

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
