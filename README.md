# Scene Scroll Web Frontend

这是一个基于 3 段视频素材制作的滚轮转场式个人网站前端原型。

## 交互逻辑

1. 首页待机：`assets/scene1.mp4` 循环播放。
2. 向下滚轮 / 点击按钮：播放 `assets/transition_1_2.mp4`，同时页面内容向左横移。
3. 转场结束：播放 `assets/scene2.mp4`。
4. 第二场景进入最后 1 秒：自动切换到 `assets/scene2_idle_loop.mp4` 循环播放，作为第二页面待机动画。
5. 向上滚轮：回到场景一待机状态。因为目前没有 2-1 回退转场视频，所以回退采用简化横移。

## 文件说明

- `index.html`：页面结构
- `styles.css`：高级简约视觉样式
- `script.js`：滚轮触发、视频切换、横向转场、第二场景末尾循环逻辑
- `assets/scene1.mp4`：场景一首页背景动画
- `assets/transition_1_2.mp4`：1-2 转场动画
- `assets/scene2.mp4`：第二场景动画
- `assets/scene2_idle_loop.mp4`：从第二场景最后 1 秒切出的待机循环素材

## 本地预览

推荐用本地服务器打开，避免部分浏览器限制视频加载：

```bash
cd scene_scroll_web_frontend
python -m http.server 5173
```

然后访问：

```text
http://localhost:5173
```

## 后续建议

如果想让“第二场景最后 1 秒循环”更无缝，最好在视频制作阶段保证最后一帧和最后一秒起始帧接近，或者单独导出一个真正首尾相接的 idle loop。
