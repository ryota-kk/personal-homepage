import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const production = process.argv.includes('--production');
const root = production ? join(projectRoot, 'dist') : projectRoot;
const totals = { desktop: 0, mobile: 0 };
for (const file of readdirSync(join(root, 'assets/media'))) {
  const data = readFileSync(join(root, 'assets/media', file));
  const boxes = {};
  for (let offset = 0; offset + 8 <= data.length;) {
    let size = data.readUInt32BE(offset);
    const type = data.toString('ascii', offset + 4, offset + 8);
    if (size === 1) size = Number(data.readBigUInt64BE(offset + 8));
    assert.ok(size >= 8 && offset + size <= data.length, `Invalid MP4 box in ${file}`);
    boxes[type] = offset;
    offset += size;
  }
  assert.ok(boxes.moov < boxes.mdat, `Missing faststart: ${file}`);
  assert.ok(data.includes(Buffer.from('avc1')), `Missing H.264 track: ${file}`);
  totals[file.includes('-mobile') ? 'mobile' : 'desktop'] += data.length;
}
const html = readFileSync(join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href|data-src|data-mobile-src|poster)="([^"]+)"/g)) {
  if (/^(https?:|#)/.test(match[1])) continue;
  const asset = match[1].split('?')[0].replace(/^\.?\//, '');
  assert.ok(existsSync(join(root, asset)), `Missing page asset: ${asset}`);
}
const projectCards = readFileSync(join(root, 'project-cards.js'), 'utf8');
for (const match of projectCards.matchAll(/(?:image|detailImage): "([^"]+)"/g)) {
  assert.ok(existsSync(join(root, match[1].replace(/^\//, ''))), `Missing project image: ${match[1]}`);
}
for (const variant of ['desktop', 'mobile']) {
  let total = 0;
  let largest = 0;
  for (let id = 1; id <= 12; id++) {
    assert.ok(existsSync(join(root, `assets/gallery/thumbs/photo${id}.jpg`)));
    const size = statSync(join(root, `assets/gallery/previews/photo${id}-${variant}.webp`)).size;
    total += size;
    largest = Math.max(size, largest);
  }
  console.log(`${variant}: videos ${(totals[variant] / 1048576).toFixed(2)} MB; gallery ${(total / 1048576).toFixed(2)} MB; largest preview ${Math.round(largest / 1024)} KB`);
}
if (production) {
  for (let id = 1; id <= 12; id++) assert.equal(existsSync(join(root, `assets/gallery/photo${id}.jpg`)), false);
  for (const original of ['scene11', 'transition_1_2', 'scene2', 'scene2_idle_loop', 'scene3']) {
    assert.equal(existsSync(join(root, `assets/${original}.mp4`)), false);
  }
  assert.equal(existsSync(join(root, 'public/videos/scene3-loop-after.mp4')), false);
  assert.ok(existsSync(join(root, 'assets/background-music.mp3')));
  console.log('Production assets verified; retained source originals are excluded from deployment.');
}
console.log('All delivery videos are H.264 faststart; all referenced posters and variants exist.');
