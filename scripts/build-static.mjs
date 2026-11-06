import { cp, mkdir, rm } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "dist");

const files = [
  "index.html",
  "styles.css",
  "script.js",
  "project-cards.js",
  "gallery-3d.js",
  "gallery-carousel.js",
  "gallery-focus.js",
  "water-ripple.js",
  "audio-spectrum.js",
  "audio-control.js",
  "effects-init.js"
];

const dirs = [
  "assets",
  "projects",
  "public"
];

const originalVideos = new Set([
  'assets/scene11.mp4', 'assets/transition_1_2.mp4', 'assets/scene2.mp4',
  'assets/scene2_idle_loop.mp4', 'assets/scene3.mp4', 'public/videos/scene3-loop-after.mp4',
]);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of files) {
  await cp(join(root, file), join(dist, file));
}

for (const dir of dirs) {
  await cp(join(root, dir), join(dist, dir), {
    recursive: true,
    filter: source => {
      const path = relative(root, source).split(sep).join('/');
      return !originalVideos.has(path) && !/^assets\/gallery\/photo\d+\.jpg$/.test(path);
    },
  });
}

console.log("Static build complete: dist");
