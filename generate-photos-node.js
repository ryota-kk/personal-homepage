const fs = require('fs');
const { createCanvas } = require('canvas');

const photos = [
  { id: 1, title: '废墟中的生机', color: '#2d5a4a' },
  { id: 2, title: '霓虹幻影', color: '#d946ef' },
  { id: 3, title: '钢铁森林', color: '#64748b' },
  { id: 4, title: '遗忘之地', color: '#3b82f6' },
  { id: 5, title: '旧日回声', color: '#f59e0b' },
  { id: 6, title: '暮色余晖', color: '#dc2626' },
  { id: 7, title: '静默守望', color: '#6366f1' },
  { id: 8, title: '碎片时光', color: '#8b5cf6' },
  { id: 9, title: '风沙过境', color: '#eab308' },
  { id: 10, title: '最后的信号', color: '#ef4444' },
  { id: 11, title: '荒原之路', color: '#06b6d4' },
  { id: 12, title: '重生之芽', color: '#22c55e' }
];

photos.forEach(photo => {
  const canvas = createCanvas(280, 200);
  const ctx = canvas.getContext('2d');

  // 背景渐变
  const gradient = ctx.createLinearGradient(0, 0, 280, 200);
  gradient.addColorStop(0, photo.color);
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 280, 200);

  // 标题
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(photo.title, 140, 100);

  // ID
  ctx.font = '14px sans-serif';
  ctx.fillText(`Photo ${photo.id}`, 140, 130);

  // 保存
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  fs.writeFileSync(`assets/gallery/photo${photo.id}.jpg`, buffer);
  console.log(`✓ Generated photo${photo.id}.jpg`);
});

console.log('All photos generated!');
