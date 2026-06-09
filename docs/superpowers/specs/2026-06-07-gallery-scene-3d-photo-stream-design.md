# Scene 3 - 3D 透视相册设计方案

**日期：** 2026-06-07  
**项目：** scene_scroll_web_frontend  
**功能：** 第三场景 - 3D 透视照片流动相册页

---

## 概述

为场景滚动网站添加第三场景，展示个人相册。使用后末日城市视频（`第三场景z.mp4`）作为背景，照片在 3D 透视空间中沿直线路径双向流动。用户可通过鼠标悬停、滚轮控制照片移动，点击照片进入电影级焦点查看模式。

---

## 设计目标

1. **沉浸感**：照片在 3D 空间中流动，营造景深和氛围感
2. **交互性**：支持悬停暂停、滚轮控制、点击查看
3. **电影级视觉**：焦点模式背景模糊、暗角加深、照片居中展示
4. **性能优先**：使用 CSS 3D Transform 硬件加速，避免 Canvas 开销
5. **风格统一**：延续现有的赛博朋克/电影级设计语言

---

## 一、整体架构

### 1.1 场景结构扩展

**现有场景：**
- Scene 1：首页（scene1.mp4 循环）
- Scene 2：作品页（transition_1_2.mp4 转场 → scene2.mp4 → scene2_idle_loop.mp4）

**新增场景：**
- Scene 3：相册页（淡入淡出转场 → scene3.mp4 循环）

### 1.2 页面布局

```
content-track 宽度扩展：200vw → 300vw
├── page-home (100vw) - 首页
├── page-work (100vw) - 作品页
└── page-gallery (100vw) - 相册页 ← 新增
    ├── video-background (scene3.mp4)
    ├── gallery-3d-stage (3D 透视容器)
    │   └── photo-track (照片流动轨道)
    │       └── photo-card × 8-12 (照片卡片)
    └── photo-detail-overlay (焦点查看模式)
```

### 1.3 视频资源

- **背景视频：** `C:\Users\25384\Desktop\网页动画素材\第三场景z.mp4`
- **存放位置：** `assets/scene3.mp4`
- **编码建议：** H.264, 1080p, 5-10Mbps
- **转场方式：** 淡入淡出（无需转场视频）

---

## 二、照片流动系统

### 2.1 HTML 结构

```html
<section class="page page-gallery">
  <!-- 背景视频 -->
  <video id="scene3Video" class="bg-video" src="./assets/scene3.mp4" 
         muted playsinline loop preload="auto"></video>
  
  <!-- 3D 透视舞台 -->
  <div class="gallery-3d-stage">
    <div class="photo-track">
      <div class="photo-card" data-id="1" data-direction="1">
        <img src="assets/gallery/photo1.jpg" alt="照片描述">
      </div>
      <!-- 更多照片 -->
    </div>
  </div>
  
  <!-- 焦点查看模式（默认隐藏）-->
  <div class="photo-detail-overlay" style="display: none;">
    <div class="photo-detail-content">
      <img class="photo-detail-image" src="" alt="">
      <aside class="photo-detail-info glass-panel">
        <span class="small-label">PHOTO INFO</span>
        <h3 class="photo-detail-title"></h3>
        <p class="photo-detail-description"></p>
        <span class="photo-detail-date"></span>
      </aside>
    </div>
  </div>
</section>
```

### 2.2 CSS 3D 配置

**核心样式：**

```css
.gallery-3d-stage {
  position: absolute;
  top: 20vh;
  left: 30vw;
  width: 40vw;
  height: 60vh;
  perspective: 1200px;
  perspective-origin: 50% 45%; /* 略偏上，匹配铁轨消失点 */
  overflow: hidden;
  pointer-events: none;
}

.photo-track {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  pointer-events: auto;
}

.photo-card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 280px;
  height: 200px;
  margin-left: -140px;
  margin-top: -100px;
  border: 1px solid var(--stroke);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease;
  will-change: transform;
}

.photo-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

**透视参数：**
- `perspective: 1200px` - 透视强度
- Z 轴范围：`-1000px`（远）到 `400px`（近）
- 照片基础尺寸：`280px × 200px`（宽高比 1.4:1）

### 2.3 照片数据结构

```javascript
const galleryPhotos = [
  {
    id: 1,
    src: 'assets/gallery/photo1.jpg',
    title: '废墟中的生机',
    description: '后末日城市中，自然重新占领了曾经的工业遗迹。',
    date: '2026.06',
    initialZ: -800,
    direction: 1  // 1=向前, -1=向后
  },
  // ... 更多照片（8-12 张）
];
```

### 2.4 流动动画逻辑

**默认状态（无交互）：**

- **向前流动（60%）：** `translateZ(-1000px)` → `translateZ(400px)`，循环
- **向后流动（40%）：** `translateZ(400px)` → `translateZ(-1000px)`，循环
- **速度：** 60-80 秒完成一次循环（缓慢营造氛围）
- **重置：** 照片移出视野后瞬间重置到起点

**景深模糊：**

```javascript
// 根据 Z 轴深度计算模糊
const blur = Math.abs(currentZ) / 100;
photoCard.style.filter = `blur(${blur}px)`;

// 模糊范围：
// Z = 0 (焦点): blur(0px)
// Z = -1000 (最远): blur(10px)
// Z = 400 (最近): blur(4px)
```

**阴影深度：**

```javascript
// 根据 Z 轴深度计算阴影
if (currentZ > 0) {
  // 近处：强阴影
  photoCard.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)';
} else if (currentZ < -500) {
  // 远处：弱阴影
  photoCard.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
}
```

---

## 三、交互系统

### 3.1 交互状态机

```
状态：
├── idle - 照片自动流动
├── hover - 鼠标悬停某张照片
├── manual-scroll - 用户滚轮控制
└── focus - 焦点查看模式
```

### 3.2 鼠标悬停效果

**触发条件：** 鼠标移入照片卡片

**视觉反馈：**
- 暂停所有照片的流动动画
- 悬停照片：`transform: scale(1.2)` + `filter: brightness(1.15)`
- 其他照片：`opacity: 0.6`
- 悬停照片边框发光：`box-shadow: 0 0 40px rgba(255,255,255,0.6)`
- 鼠标样式：`cursor: pointer`

**移出时：** 恢复流动动画，照片回到原尺寸

### 3.3 滚轮控制

**区域判定：**

```javascript
照片区域：
  X: 30vw - 70vw（中央 40% 宽度）
  Y: 20vh - 80vh（中央 60% 高度）

区域外：触发场景切换（现有逻辑）
```

**滚轮行为（在照片区域内）：**

```javascript
// 阻止场景切换
event.stopPropagation();

// 推动照片
if (deltaY > 0) {
  // 向下滚：推向远处
  allPhotos.forEach(photo => {
    photo.currentZ += 80;
  });
} else {
  // 向上滚：拉向近处
  allPhotos.forEach(photo => {
    photo.currentZ -= 80;
  });
}

// Z 轴边界限制
photo.currentZ = Math.max(-1200, Math.min(500, photo.currentZ));

// 循环重置
if (photo.currentZ > 500) photo.currentZ = -1200;
if (photo.currentZ < -1200) photo.currentZ = 500;
```

**事件节流：**
- 滚轮事件节流至 60ms/次

### 3.4 点击照片

**触发：** 点击任意照片 → 进入焦点查看模式

---

## 四、焦点查看模式

### 4.1 进入动画

**背景变化（800ms）：**

```css
/* Scene3 视频 */
#scene3Video.is-blurred {
  filter: blur(24px) brightness(0.3);
  transition: filter 800ms ease;
}

/* 深色遮罩 */
.photo-detail-overlay {
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(12px);
}

/* 暗角加深 */
.cinema-vignette {
  opacity: 1.5; /* 增强不透明度 */
}
```

**照片动画（800ms）：**

```javascript
// 被点击的照片
clickedPhoto.style.transition = 'transform 800ms cubic-bezier(0.7, 0, 0.16, 1)';
clickedPhoto.style.transform = 'translateZ(0) scale(1)'; // 归零透视

// 其他照片淡出
otherPhotos.forEach(photo => {
  photo.style.opacity = '0';
});
```

### 4.2 焦点模式布局

**照片展示：**

```css
.photo-detail-image {
  max-width: 800px;
  max-height: 70vh;
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 4px;
  box-shadow: 0 40px 120px rgba(0,0,0,0.6);
}
```

**文字信息区域：**

```css
.photo-detail-info {
  /* 复用毛玻璃样式 */
  width: 320px;
  padding: 28px;
  border-radius: 24px;
}

.photo-detail-title {
  font-size: 24px;
  font-weight: 520;
  margin-bottom: 12px;
  color: var(--text);
}

.photo-detail-description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--muted);
  margin-bottom: 18px;
}

.photo-detail-date {
  font-size: 12px;
  color: rgba(255,255,255,0.46);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
```

**布局策略：**
- 横版照片：文字信息在右侧
- 竖版照片：文字信息在下方

### 4.3 退出焦点模式

**触发方式：**
- 点击照片外任意区域
- 按 ESC 键
- 点击右上角关闭按钮（可选）

**退出动画（600ms）：**

```javascript
// 照片回到流动轨道
photoDetailOverlay.style.opacity = '0';

// 背景恢复
scene3Video.classList.remove('is-blurred');

// 其他照片淡入
allPhotos.forEach(photo => {
  photo.style.opacity = '1';
});

// 恢复流动动画
resumePhotoAnimation();
```

---

## 五、场景导航与转场

### 5.1 导航系统更新

**顶部导航点扩展：**

```html
<nav>
  <button class="nav-dot" data-go="scene1" aria-label="首页"></button>
  <button class="nav-dot" data-go="scene2" aria-label="作品页"></button>
  <button class="nav-dot is-active" data-go="scene3" aria-label="相册页"></button>
</nav>
```

**底部进度条更新：**

```javascript
const stateTexts = {
  'scene1': 'Scene 01 · Idle Loop',
  'scene2': 'Scene 02 · Projects',
  'scene3': 'Scene 03 · Gallery'  // 新增
};
```

### 5.2 淡入淡出转场

**Scene 2 → Scene 3：**

```javascript
// 1. 淡出阶段（800ms）
scene2Video.style.transition = 'opacity 800ms ease-in';
scene2Video.style.opacity = '0';

// 叠加黑色遮罩
fadeOverlay.style.background = 'rgba(0,0,0,1)';

// content-track 横移
contentTrack.style.transform = 'translateX(-200vw)';
contentTrack.style.transition = 'transform 8800ms var(--ease-cinema)';

// 2. 淡入阶段（800ms，延迟 800ms）
setTimeout(() => {
  scene3Video.style.transition = 'opacity 800ms ease-out';
  scene3Video.style.opacity = '1';
  fadeOverlay.style.background = 'rgba(0,0,0,0)';
  
  // 启动照片流动
  startPhotoAnimation();
}, 800);
```

**Scene 3 → Scene 2（反向）：**
- 相同逻辑，方向相反
- `translateX(-200vw)` → `translateX(-100vw)`

### 5.3 滚轮触发逻辑

**在 Scene 2（作品页）：**
- 向下滚轮 → 触发 Scene 2 → 3 转场

**在 Scene 3（相册页）：**
- 向上滚轮（照片区域外）→ 触发 Scene 3 → 2 转场
- 向下滚轮（照片区域外）→ 无操作（已是最后场景）

**防止误触：**

```javascript
// 转场过程中禁用滚轮
let isTransitioning = false;

function handleWheel(e) {
  if (isTransitioning) return;
  if (isInFocusMode) return; // 焦点模式不切换场景
  
  // ... 滚轮逻辑
}
```

---

## 六、视觉细节与性能优化

### 6.1 照片样式细节

**默认状态：**

```css
.photo-card {
  border: 1px solid var(--stroke);
  border-radius: 16px;
  background: rgba(13,16,22,0.36);
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}
```

**景深模糊动态计算：**

```javascript
function updatePhotoDepthEffects(photo) {
  const z = photo.currentZ;
  
  // 模糊
  const blur = Math.abs(z) / 100;
  
  // 阴影
  let shadow;
  if (z > 0) {
    shadow = '0 20px 60px rgba(0,0,0,0.4)';
  } else if (z < -500) {
    shadow = '0 5px 15px rgba(0,0,0,0.2)';
  } else {
    shadow = '0 10px 40px rgba(0,0,0,0.3)';
  }
  
  photo.element.style.filter = `blur(${blur}px)`;
  photo.element.style.boxShadow = shadow;
}
```

### 6.2 性能优化策略

**1. 照片数量控制：**
- 同时存在：8-12 张
- 超出视野：`visibility: hidden`

**2. 动画优化：**

```css
.photo-card {
  transform: translate3d(0, 0, 0); /* 开启硬件加速 */
  will-change: transform;
}
```

**3. 视频预加载：**

```javascript
// 在 Scene 2 时预加载 Scene 3 资源
if (currentScene === 'scene2') {
  const scene3Video = document.getElementById('scene3Video');
  scene3Video.load();
}
```

**4. 事件节流：**

```javascript
// 滚轮事件节流
let wheelTimeout;
function throttledWheelHandler(e) {
  if (wheelTimeout) return;
  wheelTimeout = setTimeout(() => {
    wheelTimeout = null;
  }, 60);
  
  handleWheel(e);
}
```

**5. RAF 动画循环：**

```javascript
function animatePhotos() {
  if (!isAnimating) return;
  
  photos.forEach(photo => {
    photo.currentZ += photo.direction * photo.speed;
    
    // 边界检查和重置
    if (photo.currentZ > 400) photo.currentZ = -1000;
    if (photo.currentZ < -1000) photo.currentZ = 400;
    
    // 更新 transform
    photo.element.style.transform = `translateZ(${photo.currentZ}px)`;
    
    // 更新景深效果
    updatePhotoDepthEffects(photo);
  });
  
  requestAnimationFrame(animatePhotos);
}
```

### 6.3 响应式设计

**移动端（< 768px）：**

```css
@media (max-width: 768px) {
  .gallery-3d-stage {
    top: 15vh;
    left: 10vw;
    width: 80vw;
    height: 60vh;
    perspective: 800px; /* 减弱透视 */
  }
  
  .photo-card {
    width: 220px;
    height: 157px;
  }
  
  .photo-detail-info {
    width: 90vw;
    max-width: 360px;
    margin-top: 20px; /* 移到照片下方 */
  }
}
```

**移动端交互调整：**
- 取消滚轮控制
- 使用触摸滑动（swipe）推动照片
- 照片数量减少至 6-8 张

### 6.4 可访问性

**键盘导航：**

```javascript
document.addEventListener('keydown', (e) => {
  if (!isInFocusMode) return;
  
  switch(e.key) {
    case 'Escape':
      exitFocusMode();
      break;
    case 'ArrowLeft':
      showPreviousPhoto();
      break;
    case 'ArrowRight':
      showNextPhoto();
      break;
  }
});
```

**ARIA 标签：**

```html
<div class="photo-card" 
     role="button" 
     tabindex="0"
     aria-label="查看照片：废墟中的生机">
  <img src="..." alt="废墟中的生机 - 后末日城市中的自然景观">
</div>
```

---

## 七、文件结构

### 7.1 新增文件

```
scene_scroll_web_frontend/
├── assets/
│   ├── scene3.mp4                  ← 第三场景背景视频
│   └── gallery/                    ← 相册照片目录
│       ├── photo1.jpg
│       ├── photo2.jpg
│       └── ...
├── gallery-3d.js                   ← 照片流动逻辑（新增）
├── gallery-focus.js                ← 焦点查看模式（新增）
├── styles.css                      ← 更新样式
└── script.js                       ← 更新场景切换逻辑
```

### 7.2 代码模块划分

**gallery-3d.js：**
- 照片数据管理
- 3D 流动动画
- 悬停效果
- 滚轮控制

**gallery-focus.js：**
- 焦点模式进入/退出
- 背景模糊效果
- 照片信息展示
- 键盘导航

**script.js 更新：**
- 场景导航扩展（支持 Scene 3）
- 淡入淡出转场逻辑
- 滚轮事件分发（区分照片区域/场景切换）

---

## 八、实施步骤

### 阶段 1：基础结构（2-3 小时）
1. 扩展 HTML 结构（第三场景页面）
2. 添加 Scene 3 视频背景
3. 扩展 content-track 宽度和导航系统
4. 实现淡入淡出转场

### 阶段 2：照片流动系统（3-4 小时）
1. 创建 CSS 3D 透视容器
2. 实现照片数据结构和初始化
3. 实现双向流动动画（RAF 循环）
4. 添加景深模糊和阴影效果

### 阶段 3：交互系统（2-3 小时）
1. 实现鼠标悬停效果
2. 实现滚轮控制逻辑
3. 实现区域判定（照片区域 vs 场景切换）
4. 事件节流优化

### 阶段 4：焦点查看模式（2-3 小时）
1. 实现点击照片进入焦点模式
2. 背景模糊和暗角效果
3. 照片信息展示（毛玻璃卡片）
4. 退出动画和键盘导航

### 阶段 5：优化与测试（1-2 小时）
1. 性能优化（节流、预加载、will-change）
2. 响应式适配
3. 可访问性完善
4. 跨浏览器测试

**总计：10-15 小时**

---

## 九、技术要点总结

### 核心技术栈
- **CSS 3D Transform**：`perspective`, `translateZ`, `preserve-3d`
- **JavaScript RAF**：`requestAnimationFrame` 动画循环
- **CSS Filter**：`blur()`, `brightness()` 景深效果
- **Event Handling**：滚轮节流、区域判定、键盘导航

### 关键参数
- 透视强度：`perspective: 1200px`
- Z 轴范围：`-1000px` 到 `400px`
- 照片尺寸：`280px × 200px`
- 流动速度：60-80 秒/循环
- 转场时长：800ms（淡入淡出）+ 8800ms（横移）

### 性能考量
- 照片数量：8-12 张（同时渲染）
- GPU 加速：使用 `transform` 和 `will-change`
- 事件节流：滚轮 60ms、鼠标移动 100ms
- 预加载策略：Scene 2 时加载 Scene 3 资源

### 风格延续
- 复用现有 CSS 变量（`var(--stroke)`, `var(--text)`, `var(--muted)`）
- 复用毛玻璃面板样式（`.glass-panel`）
- 使用相同的缓动函数（`var(--ease-cinema)`）
- 保持电影级暗角和颗粒效果

---

## 十、后续扩展可能

### 可选增强功能
1. **音频反馈**：照片切换时的环境音效
2. **粒子效果**：照片周围的光点漂浮
3. **照片标签**：按日期、地点、主题筛选
4. **分享功能**：分享单张照片到社交媒体
5. **自动播放**：类似幻灯片的自动切换模式

### 性能进一步优化
1. **虚拟滚动**：只渲染视野内的照片
2. **图片懒加载**：使用 Intersection Observer
3. **WebP 格式**：减少照片文件体积
4. **Service Worker**：离线缓存照片资源

---

## 结语

本设计方案采用纯 CSS 3D Transform 技术，在保证性能的前提下实现了电影级的 3D 透视照片流动效果。设计延续了现有项目的赛博朋克风格，通过直线透视路径、双向流动、悬停交互和焦点查看模式，创造了沉浸式的相册浏览体验。

实施过程中可根据实际效果微调参数（透视强度、流动速度、模糊程度），确保视觉效果与背景视频完美融合。
