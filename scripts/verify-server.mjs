import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const server = spawn(process.execPath, ['static-server.mjs'], {
  cwd: root, env: { ...process.env, PORT: '5199' }, stdio: ['ignore', 'pipe', 'inherit'],
});
const url = 'http://127.0.0.1:5199/assets/media/scene1-desktop.mp4';
try {
  await once(server.stdout, 'data');
  const head = await fetch(url, { method: 'HEAD' });
  const size = Number(head.headers.get('content-length'));
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-type'), 'video/mp4');
  assert.equal(head.headers.get('accept-ranges'), 'bytes');
  assert.ok(size > 1024);
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  const first = await fetch(url, { headers: { Range: 'bytes=0-1023' } });
  assert.equal(first.status, 206);
  assert.equal(first.headers.get('content-range'), `bytes 0-1023/${size}`);
  assert.equal((await first.arrayBuffer()).byteLength, 1024);
  const suffix = await fetch(url, { headers: { Range: 'bytes=-16' } });
  assert.equal(suffix.status, 206);
  assert.equal(suffix.headers.get('content-range'), `bytes ${size - 16}-${size - 1}/${size}`);
  assert.equal((await suffix.arrayBuffer()).byteLength, 16);
  const open = await fetch(url, { method: 'HEAD', headers: { Range: 'bytes=1024-' } });
  assert.equal(open.status, 206);
  assert.equal(Number(open.headers.get('content-length')), size - 1024);
  assert.equal((await open.arrayBuffer()).byteLength, 0);
  for (const range of [`bytes=${size}-`, 'bytes=10-5', 'bytes=-0', 'bytes=0-1,4-5']) {
    const invalid = await fetch(url, { headers: { Range: range } });
    assert.equal(invalid.status, 416);
    assert.equal(invalid.headers.get('content-range'), `bytes */${size}`);
    assert.equal((await invalid.arrayBuffer()).byteLength, 0);
  }
  assert.equal((await fetch('http://127.0.0.1:5199/missing.mp4')).status, 404);
  console.log('HTTP media checks passed: HEAD, byte ranges, suffix ranges, 416, and 404.');
} finally {
  server.kill();
}
