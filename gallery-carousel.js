// ============================================
// Gallery Carousel Preview System
// ============================================

class GalleryCarousel {
  constructor(photos) {
    this.photos = photos;
    this.currentIndex = 0;
    this.isActive = false;
    this.overlay = null;
    this.container = null;
    this.slides = [];
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;

    this.init();
  }

  init() {
    this.createOverlay();
    this.bindEvents();
  }

  createOverlay() {
    // 创建遮罩层
    this.overlay = document.createElement('div');
    this.overlay.className = 'carousel-overlay';
    this.overlay.innerHTML = `
      <div class="carousel-container">
        <div class="carousel-slides"></div>
        <button class="carousel-nav carousel-nav-prev" aria-label="Previous">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button class="carousel-nav carousel-nav-next" aria-label="Next">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <button class="carousel-close" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <div class="carousel-counter">
          <span class="carousel-current">1</span> / <span class="carousel-total">${this.photos.length}</span>
        </div>
      </div>
    `;

    this.container = this.overlay.querySelector('.carousel-slides');
    this.prevBtn = this.overlay.querySelector('.carousel-nav-prev');
    this.nextBtn = this.overlay.querySelector('.carousel-nav-next');
    this.closeBtn = this.overlay.querySelector('.carousel-close');
    this.currentCounter = this.overlay.querySelector('.carousel-current');

    // 创建所有滑块
    this.photos.forEach((photo, index) => {
      const slide = this.createSlide(photo, index);
      this.container.appendChild(slide);
      this.slides.push(slide);
    });

    document.body.appendChild(this.overlay);
  }

  createSlide(photo, index) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.dataset.index = index;

    slide.innerHTML = `
      <div class="carousel-slide-content">
        <div class="carousel-image-wrapper">
          <img data-src="${photo.src}" alt="${photo.title}" class="carousel-image" loading="lazy" />
        </div>
        <div class="carousel-info">
          <h2 class="carousel-title">${photo.title}</h2>
          <p class="carousel-description">${photo.description}</p>
          <time class="carousel-date">${photo.date}</time>
        </div>
      </div>
    `;

    return slide;
  }

  // 懒加载图片
  loadImage(index) {
    const slide = this.slides[index];
    if (!slide) return;

    const img = slide.querySelector('.carousel-image');
    if (img && img.dataset.src && !img.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
  }

  // 预加载相邻图片
  preloadAdjacentImages() {
    // 加载当前、前一张、后一张
    this.loadImage(this.currentIndex);
    this.loadImage(this.currentIndex - 1);
    this.loadImage(this.currentIndex + 1);
  }

  bindEvents() {
    // 导航按钮
    this.prevBtn.addEventListener('click', () => this.goToPrev());
    this.nextBtn.addEventListener('click', () => this.goToNext());
    this.closeBtn.addEventListener('click', () => this.close());

    // 键盘导航
    this.keyHandler = (e) => {
      if (!this.isActive) return;

      switch (e.key) {
        case 'Escape':
          this.close();
          break;
        case 'ArrowLeft':
          this.goToPrev();
          break;
        case 'ArrowRight':
          this.goToNext();
          break;
      }
    };
    document.addEventListener('keydown', this.keyHandler);

    // 点击背景关闭
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // 触摸/拖拽支持
    this.container.addEventListener('mousedown', (e) => this.onDragStart(e));
    this.container.addEventListener('touchstart', (e) => this.onDragStart(e));
    this.container.addEventListener('mousemove', (e) => this.onDragMove(e));
    this.container.addEventListener('touchmove', (e) => this.onDragMove(e));
    this.container.addEventListener('mouseup', () => this.onDragEnd());
    this.container.addEventListener('touchend', () => this.onDragEnd());
    this.container.addEventListener('mouseleave', () => this.onDragEnd());
  }

  onDragStart(e) {
    this.isDragging = true;
    this.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    this.container.style.cursor = 'grabbing';
  }

  onDragMove(e) {
    if (!this.isDragging) return;

    e.preventDefault();
    const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    const diff = currentX - this.startX;
    this.currentTranslate = this.prevTranslate + diff;
  }

  onDragEnd() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.container.style.cursor = 'grab';

    const movedBy = this.currentTranslate - this.prevTranslate;

    // 如果拖动超过 100px，切换照片
    if (movedBy < -100 && this.currentIndex < this.photos.length - 1) {
      this.goToNext();
    } else if (movedBy > 100 && this.currentIndex > 0) {
      this.goToPrev();
    }

    this.currentTranslate = this.prevTranslate;
  }

  open(photoId) {
    const index = this.photos.findIndex(p => p.id === photoId);
    if (index === -1) return;

    this.currentIndex = index;
    this.isActive = true;

    // 暂停照片墙
    if (window.gallerySystem) {
      window.gallerySystem.pause();
    }

    // 显示遮罩
    this.overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    // 更新显示
    this.updateSlides();
  }

  close() {
    if (!this.isActive) return;

    this.isActive = false;
    this.overlay.classList.remove('is-active');
    document.body.style.overflow = '';

    // 恢复照片墙
    if (window.gallerySystem) {
      window.gallerySystem.resume();
    }
  }

  goToNext() {
    if (this.currentIndex < this.photos.length - 1) {
      this.currentIndex++;
      this.updateSlides();
    }
  }

  goToPrev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateSlides();
    }
  }

  updateSlides() {
    // 预加载相邻图片
    this.preloadAdjacentImages();

    // 更新计数器
    this.currentCounter.textContent = this.currentIndex + 1;

    // 只更新可见范围内的滑块（当前 + 前后各1张）
    const visibleRange = 2; // 可见范围

    this.slides.forEach((slide, index) => {
      const offset = index - this.currentIndex;
      const isInRange = Math.abs(offset) <= visibleRange;

      slide.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');

      if (!isInRange) {
        // 不在可见范围，完全隐藏以节省性能
        slide.classList.add('is-hidden');
        slide.style.transform = 'translateX(0) scale(0.5)';
        slide.style.opacity = '0';
        slide.style.zIndex = '0';
        slide.style.visibility = 'hidden';
        return;
      }

      // 在可见范围内，正常处理
      slide.style.visibility = 'visible';

      if (offset === 0) {
        slide.classList.add('is-active');
        slide.style.transform = 'translateX(0) scale(1)';
        slide.style.opacity = '1';
        slide.style.zIndex = '10';
      } else if (offset === -1) {
        slide.classList.add('is-prev');
        slide.style.transform = 'translateX(-70%) scale(0.85)';
        slide.style.opacity = '0.4';
        slide.style.zIndex = '5';
      } else if (offset === 1) {
        slide.classList.add('is-next');
        slide.style.transform = 'translateX(70%) scale(0.85)';
        slide.style.opacity = '0.4';
        slide.style.zIndex = '5';
      } else {
        slide.style.transform = `translateX(${offset * 100}%) scale(0.7)`;
        slide.style.opacity = '0.2';
        slide.style.zIndex = '1';
      }
    });

    // 更新导航按钮状态
    this.prevBtn.disabled = this.currentIndex === 0;
    this.nextBtn.disabled = this.currentIndex === this.photos.length - 1;

    this.prevTranslate = -this.currentIndex * 100;
  }
}

// 初始化轮播系统
let carouselInstance = null;

function initCarousel() {
  if (!window.gallerySystem) {
    console.error('gallerySystem not available');
    return;
  }

  const photos = window.gallerySystem.getAllPhotos();
  carouselInstance = new GalleryCarousel(photos);
}

// 监听 gallery:focus 事件
window.addEventListener('gallery:focus', (e) => {
  if (!carouselInstance) {
    initCarousel();
  }

  const detail = e.detail;
  const photoId = typeof detail === 'object' && detail !== null
    ? detail.photoId || detail.id || detail
    : detail;

  if (carouselInstance) {
    carouselInstance.open(photoId);
  }
});

// 页面加载后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarousel);
} else {
  initCarousel();
}
