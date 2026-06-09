# 音频文件插入指南

## 📁 方案一：本地音频文件（推荐）

### 步骤：
1. 准备音频文件（支持格式：MP3, WAV, OGG, M4A）
2. 将文件重命名为 `background-music.mp3`
3. 放入项目的 `assets/` 目录
4. 刷新页面，系统会自动加载

### 文件路径示例：
```
scene_scroll_web_frontend/
├── assets/
│   ├── background-music.mp3  ← 放这里
│   ├── scene1.mp4
│   ├── scene2.mp4
│   └── ...
├── index.html
└── ...
```

### 音频文件要求：
- **格式**：MP3（推荐，兼容性最好）
- **码率**：128-320 kbps
- **时长**：建议 2-5 分钟循环播放
- **文件大小**：建议 < 5MB（避免加载过慢）
- **音量**：建议归一化到 -3dB 至 -6dB

---

## 🌐 方案二：使用 CDN 音频

如果不想在本地存储大文件，可以使用在线音频：

### 修改 `effects-init.js`：
找到第 72 行附近的 `useFallbackAudio` 函数，取消注释：

```javascript
function useFallbackAudio(audioController) {
  // 方案 2: 使用 CDN 音频
  const cdnAudioUrl = 'https://your-cdn.com/audio/background.mp3';
  audioController.loadAudio(cdnAudioUrl);
}
```

### 注意事项：
- 确保 CDN 支持 CORS（跨域资源共享）
- 音频服务器需要设置响应头：`Access-Control-Allow-Origin: *`
- 建议使用可靠的 CDN 服务（如 Cloudflare, AWS S3）

---

## 📤 方案三：用户手动上传（已内置）

如果没有找到本地音频文件，页面会自动显示"上传音频"按钮：

1. 点击右下角的"上传音频"按钮
2. 选择你的音频文件
3. 系统会立即加载并准备播放

**优点**：无需服务器，用户自行选择  
**缺点**：每次访问都需要重新上传

---

## 🎵 推荐音频资源

### 免费无版权音乐网站：
- **Incompetech**：https://incompetech.com/music/
- **Free Music Archive**：https://freemusicarchive.org/
- **Bensound**：https://www.bensound.com/
- **YouTube Audio Library**：https://www.youtube.com/audiolibrary

### 音频处理工具：
- **Audacity**（免费）：https://www.audacityteam.org/
  - 用途：剪辑、淡入淡出、音量归一化
- **Online Audio Converter**：https://online-audio-converter.com/
  - 用途：格式转换、压缩

---

## 🎛️ 音频效果配置

### 调整频谱参数

在 `effects-init.js` 第 32 行附近修改：

```javascript
audioSpectrum = new AudioSpectrumEffect(videoStage, {
  fftSize: 256,              // 频率分辨率（128, 256, 512, 1024, 2048）
  barCount: 64,              // 频谱柱数量（建议 32-128）
  barColor: 'rgba(100, 220, 220, 0.75)',  // 主颜色
  barGlowColor: 'rgba(255, 255, 255, 0.5)', // 光晕颜色
  position: 'bottom',        // 位置：bottom / top / center
  sensitivity: 1.3,          // 灵敏度（0.5-2.0）
  opacity: 0.8,              // 整体透明度（0.0-1.0）
  smoothingTimeConstant: 0.78 // 平滑系数（0.0-1.0，越大越平滑）
});
```

### 参数说明：

| 参数 | 范围 | 说明 | 推荐值 |
|------|------|------|--------|
| `fftSize` | 128-2048 | 频率分辨率，越大越精细 | 256 |
| `barCount` | 16-128 | 显示的柱子数量 | 64 |
| `sensitivity` | 0.5-2.0 | 灵敏度，控制柱子高度 | 1.2-1.5 |
| `smoothingTimeConstant` | 0.0-1.0 | 平滑度，越大越稳定 | 0.75-0.85 |
| `opacity` | 0.0-1.0 | 透明度 | 0.7-0.9 |

---

## 🔧 常见问题

### 1. 音频不播放？
- **检查浏览器控制台**：按 F12 查看错误信息
- **浏览器自动播放策略**：需要用户点击播放按钮
- **文件路径**：确认 `assets/background-music.mp3` 存在

### 2. 频谱没有动画？
- **检查音频是否正在播放**：控制面板按钮是否变为暂停图标
- **检查音量**：确保音量滑块不在最左侧
- **Web Audio API 支持**：部分老旧浏览器不支持

### 3. 频谱效果不明显？
- **调整灵敏度**：增加 `sensitivity` 参数（如 1.5-2.0）
- **增加柱子数量**：设置 `barCount: 80` 或更高
- **选择低频丰富的音乐**：鼓点、贝斯丰富的音乐效果更好

### 4. 性能问题（卡顿）？
- **减少 FFT 大小**：`fftSize: 128`
- **减少柱子数量**：`barCount: 32`
- **降低平滑度**：`smoothingTimeConstant: 0.6`
- **关闭水波效果**：注释掉 `effects-init.js` 中的水波初始化代码

---

## 🎨 视觉效果搭配建议

### 配色方案：

**青绿科技风（当前）**：
```javascript
barColor: 'rgba(100, 220, 220, 0.75)'
barGlowColor: 'rgba(255, 255, 255, 0.5)'
```

**赛博朋克风**：
```javascript
barColor: 'rgba(255, 0, 153, 0.8)'
barGlowColor: 'rgba(0, 255, 255, 0.6)'
```

**极简白色**：
```javascript
barColor: 'rgba(255, 255, 255, 0.7)'
barGlowColor: 'rgba(255, 255, 255, 0.3)'
```

**暖色调**：
```javascript
barColor: 'rgba(255, 165, 0, 0.75)'
barGlowColor: 'rgba(255, 215, 0, 0.5)'
```

---

## 📊 效果层级说明

当前 z-index 层级结构：

```
z-index: 0  → 背景视频 (.bg-video)
z-index: 1  → 电影暗角和噪点 (.cinema-vignette, .grain)
z-index: 2  → 水波层 (water-ripple canvas)
z-index: 3  → 音频频谱层 (audio-spectrum canvas)
z-index: 5  → 页面内容 (.content-track)
z-index: 20 → 顶部导航栏 (.topbar)
z-index: 30 → 进度条 (.progress-ui)
z-index: 40 → 音频控制面板 (.audio-control-panel)
```

---

## 🚀 快速测试

1. **放入音频文件**：
   ```bash
   # 复制你的音频文件到 assets 目录
   cp /path/to/your/music.mp3 assets/background-music.mp3
   ```

2. **刷新页面**（Ctrl+F5 强制刷新）

3. **点击播放按钮**（右下角音频控制面板）

4. **调整音量**（拖动滑块）

5. **观察频谱动画**（应该随音乐节奏跳动）

---

## 📝 开发者提示

### 调试模式：
在浏览器控制台输入：
```javascript
// 查看效果实例
console.log(window.effectsManager);

// 手动加载音频
effectsManager.audioController.loadAudio('path/to/audio.mp3');

// 调整音量
effectsManager.audioController.setVolume(0.8);
```

### 禁用某个效果：
编辑 `index.html`，注释掉对应的 script 标签：
```html
<!-- <script src="./water-ripple.js?v=4"></script> --> <!-- 禁用水波 -->
<!-- <script src="./audio-spectrum.js?v=1"></script> --> <!-- 禁用频谱 -->
```

---

## 📞 技术支持

如有问题，检查：
1. 浏览器控制台（F12）的错误信息
2. 网络面板查看音频文件是否加载成功
3. 确认浏览器支持 Web Audio API（Chrome, Firefox, Safari 现代版本）

**最后更新**：2026-06-05
