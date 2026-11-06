const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(__dirname, '..');
const server = spawn(process.execPath, process.env.VERIFY_DIST ? ['static-server.mjs', 'dist'] : ['static-server.mjs'], {
  cwd: root,
  env: { ...process.env, PORT: '5198' },
  stdio: ['ignore', 'pipe', 'inherit'],
});

async function state(page) {
  return page.evaluate(() => ({
    phase, isLocked, isIntroActive, leaving: isScene2Leaving,
    poster: sceneFallback.style.backgroundImage || getComputedStyle(sceneFallback).backgroundImage,
    brokenVisible: Object.values(videos).some(v => v.classList.contains('is-visible') && (v.error || v.readyState < 2)),
  }));
}

async function enter(page) {
  const earlyVideos = [];
  const watchVideo = request => { if (/\.mp[34](?:\?|$)/.test(request.url())) earlyVideos.push(request.url()); };
  page.on('request', watchVideo);
  await page.goto('http://127.0.0.1:5198/', { waitUntil: 'domcontentloaded' });
  page.off('request', watchVideo);
  assert.deepEqual(earlyVideos, [], 'intro must not preload background videos or music');
  await page.locator('#introEnterBtn').click();
  await page.waitForFunction(() => !isIntroActive);
  await page.waitForTimeout(1000);
}

async function reachScene2(page) {
  await page.locator('#enterBtn').click();
  await page.waitForFunction(() => phase === 'scene2-intro' || phase === 'scene2-idle');
  await page.evaluate(() => { videos.scene2.playbackRate = 8; });
  await page.waitForFunction(() => phase === 'scene2-idle');
}

async function run() {
  let browser;
  try {
    await once(server.stdout, 'data');
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    let page = await browser.newPage();
    await page.route('**/background-music.mp3', () => {});
    await enter(page);
    assert.equal((await state(page)).isIntroActive, false, 'music must not block entry');
    await page.close();
    console.log('PASS: stalled music does not block entry');

    page = await browser.newPage();
    await page.addInitScript(() => {
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        if (this instanceof HTMLVideoElement) return Promise.reject(new DOMException('Blocked for test', 'NotAllowedError'));
        return play.call(this);
      };
    });
    await enter(page);
    await reachScene2(page);
    await page.evaluate(() => startScene2ExitToScene3());
    await page.waitForFunction(() => phase === 'scene3-idle' && !isLocked);
    assert.equal((await state(page)).brokenVisible, false);
    assert.match((await state(page)).poster, /posters/);
    await page.evaluate(() => goScene4());
    await page.waitForFunction(() => phase === 'scene4-idle' && !isLocked);
    await page.close();
    console.log('PASS: rejected video playback falls back and scenes remain navigable');

    page = await browser.newPage();
    const delayed = [];
    await page.route(/scene3(?:-(?:desktop|mobile))?\.mp4/, route => { delayed.push(route); });
    await enter(page);
    await reachScene2(page);
    await page.evaluate(() => startScene2ExitToScene3());
    await page.waitForFunction(() => phase === 'scene3-idle' && !isLocked && !isScene2Leaving);
    await page.evaluate(() => goScene4());
    await page.waitForFunction(() => phase === 'scene4-idle' && !isLocked);
    await Promise.all(delayed.map(route => route.continue().catch(() => {})));
    await page.waitForTimeout(1200);
    assert.equal((await state(page)).phase, 'scene4-idle', 'late video must not restore an old scene');
    await page.close();
    console.log('PASS: hanging scene video does not lock navigation; stale playback is cancelled');

    page = await browser.newPage();
    await page.route(/scene2(?:_idle_loop|\-idle\-(?:desktop|mobile))\.mp4/, route => route.abort('failed'));
    await enter(page);
    await reachScene2(page);
    await page.waitForTimeout(800);
    assert.equal((await state(page)).brokenVisible, false, 'failed loop must not cover the poster');
    assert.equal((await state(page)).isLocked, false);
    await page.close();
    console.log('PASS: failed loop video retains a usable background');

    for (const mobile of [false, true]) {
      page = await browser.newPage({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
        isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1,
      });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await enter(page);
      await page.waitForFunction(() => videos.scene1.readyState >= 2 && !videos.scene1.paused);
      const firstFrames = await page.evaluate(() => videos.scene1.getVideoPlaybackQuality().totalVideoFrames);
      await page.waitForTimeout(500);
      const playback = await page.evaluate(() => {
        const video = videos.scene1;
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 9;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, 16, 9);
        const pixels = context.getImageData(0, 0, 16, 9).data;
        return {
          frames: video.getVideoPlaybackQuality().totalVideoFrames,
          litPixels: pixels.some((value, index) => index % 4 !== 3 && value > 8),
          source: video.currentSrc,
        };
      });
      assert.ok(playback.frames > firstFrames, 'normal background video must advance');
      assert.equal(playback.litPixels, true, 'decoded video frame must not be blank');
      assert.match(playback.source, mobile ? /-mobile\.mp4$/ : /-desktop\.mp4$/);
      await reachScene2(page);
      await page.waitForFunction(() => videos.scene2Idle.readyState >= 2 && !videos.scene2Idle.paused);
      await page.locator('[data-project-id="other-projects"]').click();
      await page.locator('.project-collection-site-link').waitFor({ state: 'visible' });
      await page.locator('#projectCollectionModal button[data-collection-close]').click();
      await page.waitForTimeout(400);
      const client = await page.context().newCDPSession(page);
      const move = async direction => {
        if (!mobile) return page.mouse.wheel(0, direction * 500);
        await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 5, y: 500 }] });
        await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 5, y: 500 - direction * 130 }] });
        await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      };
      for (const [direction, target] of [[1, 'scene3-idle'], [1, 'scene4-idle'], [-1, 'scene3-idle'], [-1, 'scene2-idle'], [-1, 'scene1-idle']]) {
        await move(direction);
        await page.waitForFunction(targetPhase => phase === targetPhase && !isLocked, target);
        await page.waitForTimeout(750);
        if (target === 'scene3-idle') {
          const lifecycle = await page.evaluate(async () => {
            Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
            document.dispatchEvent(new Event('visibilitychange'));
            const paused = Object.values(videos).every(video => video.paused) && rafId === null;
            delete document.hidden;
            document.dispatchEvent(new Event('visibilitychange'));
            return { paused, galleryResumed: rafId !== null };
          });
          assert.equal(lifecycle.paused, true, 'hidden tabs must stop media and gallery animation');
          assert.equal(lifecycle.galleryResumed, true);
        }
      }
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`PASS: ${mobile ? 'mobile touch' : 'desktop wheel'} full scene round trip and project modal`);
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
