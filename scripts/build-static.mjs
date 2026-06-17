import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
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

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of files) {
  await cp(join(root, file), join(dist, file));
}

for (const dir of dirs) {
  await cp(join(root, dir), join(dist, dir), { recursive: true });
}

console.log("Static build complete: dist");
