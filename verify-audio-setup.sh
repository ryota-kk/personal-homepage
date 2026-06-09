#!/bin/bash
# 音频频谱效果验证脚本

echo "=========================================="
echo "  音频频谱效果 - 安装验证"
echo "=========================================="
echo ""

# 检查项目目录
if [ ! -f "index.html" ]; then
    echo "❌ 错误：未在正确的项目目录中"
    echo "请在项目根目录运行此脚本"
    exit 1
fi

echo "✓ 项目目录正确"
echo ""

# 检查核心文件
echo "检查核心文件..."
files=(
    "audio-spectrum.js"
    "audio-control.js"
    "effects-init.js"
    "AUDIO_GUIDE.md"
    "README_AUDIO.md"
)

all_ok=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        echo "  ✓ $file ($size)"
    else
        echo "  ❌ $file - 文件不存在"
        all_ok=false
    fi
done
echo ""

# 检查 HTML 引用
echo "检查 HTML 脚本引用..."
if grep -q "audio-spectrum.js" index.html && \
   grep -q "audio-control.js" index.html && \
   grep -q "effects-init.js" index.html; then
    echo "  ✓ 所有脚本已正确引入 HTML"
else
    echo "  ❌ HTML 引用不完整"
    all_ok=false
fi
echo ""

# 检查 CSS 样式
echo "检查 CSS 样式..."
if grep -q "audio-control-panel" styles.css; then
    echo "  ✓ 音频控制面板样式已添加"
else
    echo "  ❌ CSS 样式缺失"
    all_ok=false
fi
echo ""

# 检查音频文件
echo "检查音频文件..."
if [ -f "assets/background-music.mp3" ]; then
    size=$(du -h "assets/background-music.mp3" | cut -f1)
    echo "  ✓ 音频文件存在: background-music.mp3 ($size)"
elif [ -f "assets/background-music.wav" ]; then
    size=$(du -h "assets/background-music.wav" | cut -f1)
    echo "  ⚠️  找到 WAV 文件 ($size)"
    echo "     建议转换为 MP3 以获得更好的兼容性"
else
    echo "  ⚠️  未找到音频文件"
    echo "     请将音频文件放入 assets/background-music.mp3"
    echo "     或使用页面上的'上传音频'按钮"
fi
echo ""

# 检查服务器
echo "检查开发服务器..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null | grep -q "200"; then
    echo "  ✓ 服务器运行中: http://localhost:5173/"
else
    echo "  ⚠️  服务器未运行"
    echo "     请运行: python -m http.server 5173"
fi
echo ""

# 最终报告
echo "=========================================="
if [ "$all_ok" = true ]; then
    echo "✅ 所有核心文件安装成功！"
    echo ""
    echo "下一步操作："
    echo "1. 访问 http://localhost:5173/"
    echo "2. 点击右下角的播放按钮"
    echo "3. 调整音量滑块"
    echo "4. 观察底部的音频频谱动画"
    echo ""
    echo "如需帮助，请查看 AUDIO_GUIDE.md"
else
    echo "⚠️  部分文件缺失或配置不完整"
    echo "请检查上述错误信息"
fi
echo "=========================================="
