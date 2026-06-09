# Scene 3 - 3D 透视相册实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现第三场景 3D 透视照片流动相册页，支持双向流动、悬停暂停、滚轮控制和焦点查看模式

**Architecture:** 使用 CSS 3D Transform + RAF 动画循环实现照片在 Z 轴上的双向流动，通过事件委托和区域路由处理交互，状态机管理悬停/滚动/聚焦状态

**Tech Stack:** 原生 JavaScript (ES6+), CSS 3D Transform, requestAnimationFrame, Intersection Observer

---

## 文件结构设计

### 新增文件
- `gallery-3d.js` - 照片流动系统核心逻辑（RAF 循环、Z 轴管理、双向流动）
- `gallery-focus.js` - 焦点查看模式（进入/退出动画、键盘导航）
- `assets/scene3.mp4` - 后末日城市背景视频
- `assets/gallery/photo1.jpg` ~ `photo12.jpg` - 相册照片资源（280×200px）

### 修改文件
- `index.html` - 扩展 content-track 至 300vw，添加 page-gallery 结构和 scene3 视频
- `styles.css` - 添加 3D 透视样式、照片卡片样式、焦点模式样式
- `script.js` - 扩展 phase 状态机支持 scene3，实现淡入淡出转场和区域路由

---

## Task 1: 资源准备

**Files:**
- Create: `assets/scene3.mp4`
- Create: `assets/gallery/photo1.jpg` ~ `assets/gallery/photo12.jpg`

- [ ] **Step 1: 转换视频格式**

```bash
cd "C:/Users/25384/Desktop/cl/web前端/scene_scroll_web_frontend/scene_scroll_web_frontend/assets"
ffmpeg -i "C:/Users/25384/Desktop/网页动画素材/第三场景z.mp4" -vcodec h264 -b:v 8M -preset slow -movflags +faststart scene3.mp4
Expected output: scene3.mp4 创建成功，文件大小约 20-40MB

 Step 2: 验证视频可播放
在浏览器中打开 file:///C:/Users/25384/Desktop/cl/web前端/scene_scroll_web_frontend/scene_scroll_web_frontend/assets/scene3.mp4

Expected: 视频能正常播放，显示后末日城市场景

 Step 3: 创建相册目录并准备占位图片

mkdir -p assets/gallery
cd assets/gallery
创建 12 张占位图片（后续替换为实际照片）：


for i in {1..12}; do
  convert -size 280x200 xc:gray -pointsize 30 -draw "text 100,100 'Photo $i'" "photo$i.jpg"
done
如无 ImageMagick，手动创建 12 张 280×200px 的灰色占位图

Expected: assets/gallery/ 目录包含 photo1.jpg ~ photo12.jpg

 Step 4: 提交资源

git add assets/scene3.mp4 assets/gallery/
git commit -m "feat(scene3): add video and placeholder photos

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
Task 2: HTML 结构扩展
Files:

Modify: index.html:15 (content-track 宽度)

Modify: index.html:17-40 (添加 page-gallery)

Modify: index.html:45-58 (添加 scene3Video)

Modify: index.html:96-100 (添加第三个 nav-dot)

 Step 1: 扩展 content-track 宽度

修改 index.html:15：


<div class="content-track" style="width: 300vw;">
 Step 2: 添加 page-gallery 结构
在 </div><!-- page-work --> 之后添加：


    </div><!-- page-work -->

    <!-- Page 3: Gallery -->
    <div class="page-gallery">
      <div class="gallery-3d-stage">
        <div class="photo-track" id="photoTrack">
          <!-- Photos injected by gallery-3d.js -->
        </div>
      </div>
      
      <div class="photo-detail-overlay" id="photoDetail">
        <div class="detail-content">
          <img class="detail-image" id="detailImage" src="" alt="">
          <div class="detail-info">
            <h2 class="detail-title" id="detailTitle"></h2>
            <p class="detail-description" id="detailDescription"></p>
            <time class="detail-date" id="detailDate"></time>
          </div>
          <button class="detail-close" id="detailClose">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div><!-- page-gallery -->

  </div><!-- content-track -->
 Step 3: 添加 scene3 视频
在 <video id="scene2IdleVideo" ...> 之后添加：


    <video id="scene3Video" class="video-layer" muted playsinline loop>
      <source src="assets/scene3.mp4" type="video/mp4">
    </video>
  </div><!-- video-stage -->
 Step 4: 添加第三个导航点
在 <div class="nav-dot" data-scene="2"></div> 之后添加：


      <div class="nav-dot" data-scene="2"></div>
      <div class="nav-dot" data-scene="3"></div>
    </nav>
 Step 5: 在 HTML 底部引入新脚本
在 <script src="script.js"></script> 之后添加：


  <script src="script.js"></script>
  <script src="gallery-3d.js"></script>
  <script src="gallery-focus.js"></script>
</body>
 Step 6: 验证 HTML 结构
在浏览器中打开 index.html，打开开发者工具 Elements 面板

Expected:

content-track 宽度为 300vw

page-gallery 存在且包含 gallery-3d-stage 和 photo-detail-overlay

video-stage 包含 scene3Video

nav-dots 包含 3 个 nav-dot

 Step 7: 提交 HTML 更改


git add index.html
git commit -m "feat(scene3): extend HTML structure for gallery scene

- Expand content-track to 300vw
- Add page-gallery with 3D stage and detail overlay
- Add scene3 video layer
- Add third navigation dot

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
Task 3: CSS 3D 样式系统
Files:

Modify: styles.css (在文件末尾添加)

 Step 1: 添加 page-gallery 基础样式

在 styles.css 末尾添加：


/* ============================================
   Scene 3: Gallery Page
   ============================================ */

.page-gallery {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.gallery-3d-stage {
  position: absolute;
  inset: 0;
  perspective: 1200px;
  perspective-origin: 50% 50%;
}

.photo-track {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}
 Step 2: 添加 photo-card 3D 样式

.photo-card {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 280px;
  height: 200px;
  margin-left: -140px;
  margin-top: -100px;
  
  transform-style: preserve-3d;
  will-change: transform, filter;
  
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  
  cursor: pointer;
  transition: filter 0.3s var(--ease-cinema);
}

.photo-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.photo-card.is-hovered {
  filter: brightness(1.2) saturate(1.3);
}

.photo-card.is-blurred {
  filter: blur(8px) brightness(0.7);
}
 Step 3: 添加焦点模式样式

.photo-detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  background: rgba(9, 11, 15, 0.95);
  backdrop-filter: blur(24px);
  
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.8s cubic-bezier(0.7, 0, 0.16, 1);
}

.photo-detail-overlay.is-active {
  opacity: 1;
  pointer-events: all;
}

.detail-content {
  position: relative;
  display: flex;
  gap: 3rem;
  max-width: 90vw;
  max-height: 90vh;
  
  transform: scale(0.9) translateY(20px);
  transition: transform 0.8s cubic-bezier(0.7, 0, 0.16, 1);
}

.photo-detail-overlay.is-active .detail-content {
  transform: scale(1) translateY(0);
}

.detail-image {
  width: auto;
  max-width: 60vw;
  max-height: 80vh;
  height: auto;
  
  border-radius: 4px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.detail-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  max-width: 320px;
  
  padding: 2rem;
  background: var(--panel);
  border: 1px solid var(--stroke);
  border-radius: 8px;
  backdrop-filter: blur(12px);
}

.detail-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.detail-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--muted);
  margin: 0;
}

.detail-date {
  font-size: 0.85rem;
  color: var(--faint);
  font-variant-numeric: tabular-nums;
}

.detail-close {
  position: absolute;
  top: 2rem;
  right: 2rem;
  
  width: 48px;
  height: 48px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  background: var(--panel);
  border: 1px solid var(--stroke);
  border-radius: 50%;
  
  color: var(--muted);
  cursor: pointer;
  
  transition: all 0.2s ease;
}

.detail-close:hover {
  background: var(--panel-strong);
  color: var(--text);
  transform: scale(1.1);
}
 Step 4: 验证样式渲染
在浏览器中打开页面，使用开发者工具检查 .gallery-3d-stage 的 computed styles

Expected:

perspective: 1200px

transform-style: preserve-3d 生效

 Step 5: 提交 CSS 更改


git add styles.css
git commit -m "feat(scene3): add 3D perspective and focus mode styles

- Add gallery-3d-stage with perspective: 1200px
- Add photo-card 3D transform styles with depth blur
- Add photo-detail-overlay focus mode styles
- Add glass-panel detail-info styling

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
Task 4: 场景导航逻辑扩展
Files:

Modify: script.js:1-20 (添加 scene3Video 引用和初始化)

Modify: script.js:70-150 (扩展 phase 状态机)

 Step 1: 添加 scene3Video 引用

在 script.js 顶部的视频引用区域添加：


const scene3Video = document.getElementById('scene3Video');
 Step 2: 在 initializeApp 中初始化 scene3Video
在 scene2IdleVideo.pause(); 之后添加：


  scene2IdleVideo.pause();
  
  if (scene3Video) {
    scene3Video.currentTime = 0;
    scene3Video.pause();
  }
}
 Step 3: 扩展 phase 状态支持 scene3
在现有 phase 转换逻辑中添加 scene2 → scene3 转场。找到 if (phase === 'scene2-idle' && delta > 0) 附近，添加：


  // Scene 2 → Scene 3 (Fade transition)
  if (phase === 'scene2-idle' && delta > 0 && !isLocked) {
    isLocked = true;
    phase = 'transition-2-3';
    
    // Fade out scene2
    scene2IdleVideo.style.transition = 'opacity 0.8s ease';
    scene2IdleVideo.style.opacity = '0';
    
    setTimeout(() => {
      scene2IdleVideo.pause();
      scene2IdleVideo.style.display = 'none';
      
      // Fade in scene3
      scene3Video.style.display = 'block';
      scene3Video.style.opacity = '0';
      scene3Video.play();
      
      requestAnimationFrame(() => {
        scene3Video.style.transition = 'opacity 0.8s ease';
        scene3Video.style.opacity = '1';
      });
      
      // Scroll to scene3
      contentTrack.style.transition = `transform ${transitionDuration}ms var(--ease-cinema)`;
      contentTrack.style.transform = 'translateX(-200vw)';
      
      setTimeout(() => {
        phase = 'scene3-idle';
        isLocked = false;
        updateDots(2);
        
        // Notify gallery system
        window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 3 } }));
      }, transitionDuration);
      
    }, 800);
    
    return;
  }
  
  // Scene 3 → Scene 2 (Fade transition)
  if (phase === 'scene3-idle' && delta < 0 && !isLocked) {
    isLocked = true;
    phase = 'transition-3-2';
    
    // Fade out scene3
    scene3Video.style.transition = 'opacity 0.8s ease';
    scene3Video.style.opacity = '0';
    
    setTimeout(() => {
      scene3Video.pause();
      scene3Video.style.display = 'none';
      
      // Fade in scene2
      scene2IdleVideo.style.display = 'block';
      scene2IdleVideo.style.opacity = '0';
      scene2IdleVideo.play();
      
      requestAnimationFrame(() => {
        scene2IdleVideo.style.transition = 'opacity 0.8s ease';
        scene2IdleVideo.style.opacity = '1';
      });
      
      // Scroll to scene2
      contentTrack.style.transition = `transform ${transitionDuration}ms var(--ease-cinema)`;
      contentTrack.style.transform = 'translateX(-100vw)';
      
      setTimeout(() => {
        phase = 'scene2-idle';
        isLocked = false;
        updateDots(1);
        
        // Notify gallery system
        window.dispatchEvent(new CustomEvent('scene:change', { detail: { scene: 2 } }));
      }, transitionDuration);
      
    }, 800);
    
    return;
  }
 Step 4: 添加区域路由逻辑
在 wheel 事件处理函数中，scene3-idle 阶段需要区分照片区域和边缘切换区域：


  if (phase === 'scene3-idle') {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Photo interaction area: 30-70vw × 20-80vh
    const inPhotoArea = (
      e.clientX > viewportWidth * 0.3 &&
      e.clientX < viewportWidth * 0.7 &&
      e.clientY > viewportHeight * 0.2 &&
      e.clientY < viewportHeight * 0.8
    );
    
    if (inPhotoArea) {
      // Route to gallery-3d.js wheel handler
      window.dispatchEvent(new CustomEvent('gallery:wheel', { detail: { deltaY: e.deltaY } }));
      return;
    }
    
    // Outside photo area: scene navigation
    // (existing scene transition logic continues)
  }
 Step 5: 测试场景切换
在浏览器中打开页面，滚动到 scene2，继续向下滚动

Expected:

scene2IdleVideo 淡出（0.8s）

scene3Video 淡入（0.8s）

content-track 滑动到 -200vw（8.8s）

phase 变为 'scene3-idle'

第三个 nav-dot 变为 active

 Step 6: 测试反向切换

在 scene3 状态下向上滚动

Expected:

scene3Video 淡出

scene2IdleVideo 淡入

content-track 滑动回 -100vw

phase 变为 'scene2-idle'

 Step 7: 提交场景导航更改


git add script.js
git commit -m "feat(scene3): extend phase state machine for scene3 navigation

- Add scene3Video initialization
- Add fade transition scene2 ↔ scene3 (800ms fade + 8800ms slide)
- Add area-based scroll routing (30-70vw × 20-80vh photo area)
- Update phase states: scene3-idle, transition-2-3, transition-3-2

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
Task 5: 照片流动系统
Files:

Create: gallery-3d.js

 Step 1: 创建照片数据和初始化结构

创建 gallery-3d.js：


// ============================================
// Gallery 3D Photo Stream System
// ============================================

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
 Step 2: 实现照片元素创建

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
    
    photoElements.push({
      element: card,
      data: photo,
      currentZ: photo.initialZ
    });
  });
}
 Step 3: 实现 Z 轴更新和深度模糊

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
 Step 4: 实现 RAF 动画循环

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
 Step 5: 实现滚轮控制

window.addEventListener('gallery:wheel', (e) => {
  const delta = e.detail.deltaY;
  manualScrollDelta = delta > 0 ? SCROLL_DELTA : -SCROLL_DELTA;
});
 Step 6: 实现悬停暂停

document.addEventListener('mousemove', (e) => {
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
});
 Step 7: 初始化

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
 Step 8: 测试照片流动
在浏览器中打开页面，滚动到 scene3

Expected:

12 张照片显示在 3D 空间中

照片沿 Z 轴双向流动（约 60% 向前，40% 向后）

近处照片清晰，远处照片模糊

悬停时照片停止流动

 Step 9: 测试滚轮控制

在 scene3 的照片区域（中央 40% × 60%）内滚动鼠标滚轮

Expected:

向下滚动：照片向前移动（Z 增加）

向上滚动：照片向后移动（Z 减少）

超出边界时循环

 Step 10: 提交照片流动系统


git add gallery-3d.js
git commit -m "feat(scene3): implement 3D photo stream system

- Add 12 photos with dual-directional flow (60% forward, 40% backward)
- Implement RAF animation loop at 0.5px/frame
- Add Z-axis boundary looping (-1000px to 400px)
- Add depth-based blur effect (Math.abs(z) / 100)
- Add hover pause interaction
- Add wheel scroll control (±80px per event)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
Task 6: 交互系统优化
Files:

Modify: gallery-3d.js (优化事件处理和性能)

 Step 1: 添加节流函数

在 gallery-3d.js 顶部添加：


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
 Step 2: 优化悬停检测
将原有的 mousemove 监听器替换为节流版本：


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
 Step 3: 添加点击进入焦点模式
在 createPhotoElements() 函数中添加点击事件：


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
 Step 4: 添加导出函数供焦点模式使用
在文件末尾添加：


// Export for gallery-focus.js
window.gallerySystem = {
  getPhotoById: (id) => PHOTOS.find(p => p.id === id),
  getAllPhotos: () => PHOTOS,
  pause: () => { isPaused = true; },
  resume: () => { isPaused = false; }
};
 Step 5: 测试优化后的交互
在浏览器中打开页面，滚动到 scene3

Expected:

鼠标移动时不卡顿（节流生效）

点击照片触发 'gallery:focus' 事件（控制台可见）

悬停和恢复流畅

 Step 6: 提交交互优化


git add gallery-3d.js
git commit -m "feat(scene3): optimize gallery interactions

- Add throttle helper (100ms for mousemove)
- Add click-to-focus event dispatch
- Export gallery system API for focus mode
- Improve hover detection performance

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
Task 7: 焦点查看模式
Files:

Create: gallery-focus.js

 Step 1: 创建焦点模式核心结构

创建 gallery-focus.js：


// ============================================
// Gallery Focus Mode
// ============================================

let currentPhotoId = null;
let isActive = false;

const overlay = document.getElementById('photoDetail');
const detailImage = document.getElementById('detailImage');
const detailTitle = document.getElementById('detailTitle');
const detailDescription = document.getElementById('detailDescription');
const detailDate = document.getElementById('detailDate');
const closeButton = document.getElementById('detailClose');
 Step 2: 实现进入焦点模式

function enterFocusMode(photoId) {
  if (!window.gallerySystem) return;
  
  const photo = window.gallerySystem.getPhotoById(photoId);
  if (!photo) return;
  
  currentPhotoId = photoId;
  isActive = true;
  
  // Pause photo flow
  window.gallerySystem.pause();
  
  // Populate content
  detailImage.src = photo.src;
  detailImage.alt = photo.title;
  detailTitle.textContent = photo.title;
  detailDescription.textContent = photo.description;
  detailDate.textContent = photo.date;
  
  // Show overlay
  overlay.classList.add('is-active');
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}
 Step 3: 实现退出焦点模式

function exitFocusMode() {
  if (!isActive) return;
  
  isActive = false;
  currentPhotoId = null;
  
  // Hide overlay
  overlay.classList.remove('is-active');
  
  // Resume photo flow
  if (window.gallerySystem) {
    window.gallerySystem.resume();
  }
  
  // Restore body scroll
  document.body.style.overflow = '';
}
 Step 4: 实现键盘导航

function navigateToNext() {
  if (!window.gallerySystem || !currentPhotoId) return;
  
  const photos = window.gallerySystem.getAllPhotos();
  const currentIndex = photos.findIndex(p => p.id === currentPhotoId);
  const nextIndex = (currentIndex + 1) % photos.length;
  const nextPhoto = photos[nextIndex];
  
  enterFocusMode(nextPhoto.id);
}

function navigateToPrevious() {
  if (!window.gallerySystem || !currentPhotoId) return;
  
  const photos = window.gallerySystem.getAllPhotos();
  const currentIndex = photos.findIndex(p => p.id === currentPhotoId);
  const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
  const prevPhoto = photos[prevIndex];
  
  enterFocusMode(prevPhoto.id);
}

document.addEventListener('keydown', (e) => {
  if (!isActive) return;
  
  switch (e.key) {
    case 'Escape':
      exitFocusMode();
      break;
    case 'ArrowRight':
      navigateToNext();
      break;
    case 'ArrowLeft':
      navigateToPrevious();
      break;
  }
});
 Step 5: 绑定事件监听器

// Listen for focus requests
window.addEventListener('gallery:focus', (e) => {
  enterFocusMode(e.detail.photoId);
});

// Close button
if (closeButton) {
  closeButton.addEventListener('click', exitFocusMode);
}

// Click overlay background to close
if (overlay) {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      exitFocusMode();
    }
  });
}
 Step 6: 测试焦点模式进入
在浏览器中打开页面，滚动到 scene3，点击任意照片

Expected:

overlay 淡入显示（0.8s）

照片居中放大显示

右侧显示照片信息（标题、描述、日期）

照片流动暂停

页面滚动被禁用

 Step 7: 测试焦点模式退出

在焦点模式下点击关闭按钮或按 ESC 键

Expected:

overlay 淡出消失（0.8s）

照片流动恢复

页面滚动恢复

 Step 8: 测试键盘导航

在焦点模式下按左右方向键

Expected:

右箭头：切换到下一张照片

左箭头：切换到上一张照片

内容平滑过渡

 Step 9: 提交焦点模式


git add gallery-focus.js
git commit -m "feat(scene3): implement focus mode for photo viewing

- Add enter/exit focus mode with 800ms fade transition
- Add photo detail display (title, description, date)
- Add keyboard navigation (ESC, Arrow Left/Right)
- Add click-to-close on overlay background
- Pause photo flow during focus mode

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
Task 8: 性能优化和最终测试
Files:

Modify: gallery-3d.js (添加性能优化)

Modify: styles.css (添加响应式支持)

 Step 1: 添加 will-change 优化

在 updatePhotoPositions() 函数中，当照片接近可见范围时添加 will-change：


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
    const scale = 1 + (photo.currentZ / 1000);
    photo.element.style.transform = `translateZ(${translateZ}px) scale(${scale})`;
    
    // Depth blur
    const blurAmount = Math.abs(photo.currentZ) / 100;
    photo.element.style.filter = `blur(${blurAmount}px)`;
    
    // Opacity and visibility optimization
    const isVisible = photo.currentZ > -800 && photo.currentZ < 300;
    photo.element.style.opacity = isVisible ? 1 : 0;
    
    // Performance: remove will-change when not visible
    if (isVisible && photo.currentZ > -200 && photo.currentZ < 100) {
      photo.element.style.willChange = 'transform, filter';
    } else {
      photo.element.style.willChange = 'auto';
    }
  });
  
  // Reset manual scroll
  manualScrollDelta = 0;
}
 Step 2: 添加移动端响应式样式
在 styles.css 的 Gallery 部分末尾添加：


/* Mobile responsive */
@media (max-width: 768px) {
  .gallery-3d-stage {
    perspective: 800px;
  }
  
  .photo-card {
    width: 200px;
    height: 143px;
    margin-left: -100px;
    margin-top: -71px;
  }
  
  .detail-content {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem;
  }
  
  .detail-image {
    max-width: 90vw;
    max-height: 50vh;
  }
  
  .detail-info {
    max-width: 100%;
  }
  
  .detail-close {
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .photo-card {
    width: 160px;
    height: 114px;
    margin-left: -80px;
    margin-top: -57px;
  }
  
  .detail-title {
    font-size: 1.2rem;
  }
  
  .detail-description {
    font-size: 0.875rem;
  }
}
 Step 3: 添加触摸支持
在 gallery-3d.js 中添加触摸事件处理：


// Touch support for mobile
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  const track = document.getElementById('photoTrack');
  if (!track) return;
  
  const rect = track.getBoundingClientRect();
  const touch = e.touches[0];
  
  if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
      touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
    touchStartY = touch.clientY;
  }
});

document.addEventListener('touchmove', (e) => {
  if (touchStartY === 0) return;
  
  const touch = e.touches[0];
  const deltaY = touchStartY - touch.clientY;
  
  if (Math.abs(deltaY) > 5) {
    manualScrollDelta = deltaY > 0 ? SCROLL_DELTA : -SCROLL_DELTA;
    touchStartY = touch.clientY;
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('touchend', () => {
  touchStartY = 0;
});
 Step 4: 测试性能
在浏览器开发者工具中：

打开 Performance 面板
开始录制
滚动到 scene3，观察照片流动 5 秒
停止录制
Expected:

FPS 保持在 55-60

Main thread 不应有长任务（>50ms）

GPU 使用率稳定

 Step 5: 测试移动端响应式

在开发者工具中切换到移动设备模式（iPhone SE, iPad）

Expected:

照片尺寸自适应

焦点模式布局切换为竖向

触摸滑动可以控制照片流动

 Step 6: 完整功能测试

按以下流程测试：

从 scene1 滚动到 scene3（测试转场）
观察照片自动流动 10 秒（测试 RAF 循环）
悬停在一张照片上（测试暂停）
使用滚轮控制照片移动（测试滚轮）
点击照片进入焦点模式（测试进入）
按左右键切换照片（测试导航）
按 ESC 退出（测试退出）
向上滚动回 scene2（测试反向转场）
Expected: 所有功能正常运行，无报错

 Step 7: 代码质量检查

# Check for console.log (should remove debug logs)
grep -r "console.log" gallery-3d.js gallery-focus.js

# Check for TODO/FIXME
grep -r "TODO\|FIXME" gallery-3d.js gallery-focus.js
Expected: 无 console.log 和 TODO/FIXME

 Step 8: 提交优化更改

git add gallery-3d.js styles.css
git commit -m "feat(scene3): add performance optimizations and mobile support

- Add dynamic will-change management for visible photos
- Add mobile responsive styles (768px, 480px breakpoints)
- Add touch event support for mobile swipe control
- Optimize opacity and visibility calculations
- Test FPS: 55-60fps stable

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
 Step 9: 最终验证和文档
在浏览器中完整测试所有功能，确认：

✅ Scene 3 转场动画流畅（淡入淡出 + 横向滑动）

✅ 12 张照片在 3D 空间中双向流动

✅ 深度模糊效果正确（远处模糊，近处清晰）

✅ 悬停暂停功能正常

✅ 滚轮控制灵敏

✅ 焦点模式进入/退出流畅

✅ 键盘导航响应正确

✅ 移动端触摸支持正常

✅ 性能稳定（55-60 FPS）

 Step 10: 更新项目文档

在项目 README 或文档中记录 Scene 3 功能：


## Scene 3: 3D Photo Gallery

**Features:**
- 12 photos flowing in 3D perspective space
- Dual-directional flow (60% forward, 40% backward)
- Depth-based blur effect
- Hover to pause, wheel to control
- Click to enter focus mode with detail view
- Keyboard navigation (ESC, Arrow keys)
- Mobile touch support

**Technical:**
- CSS 3D Transform (perspective: 1200px)
- RAF animation loop at 60fps
- Z-axis range: -1000px to 400px
- Performance optimized with will-change management
 Step 11: 最终提交

git add README.md
git commit -m "docs(scene3): document 3D gallery features and technical details

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
自我审查清单
✅ 规范覆盖
 3D 透视照片流动系统
 双向流动（60% 前进，40% 后退）
 深度模糊效果
 悬停暂停交互
 滚轮控制
 焦点查看模式
 键盘导航
 场景转场（淡入淡出）
 区域路由（照片区域 vs 切换区域）
 移动端支持
 性能优化
✅ 占位符检查
无 "TBD" 或 "TODO"
所有代码块完整
所有测试步骤有明确的 Expected 输出
所有文件路径精确
✅ 类型一致性
phase 状态：scene3-idle, transition-2-3, transition-3-2
事件名称：gallery:wheel, gallery:focus, scene:change
Z 轴常量：Z_MIN = -1000, Z_MAX = 400
照片数据结构：id, src, title, description, date, initialZ, direction
CSS 类名：photo-card, is-hovered, is-active