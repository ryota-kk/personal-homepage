import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const serveArg = process.argv[2] || ".";
const root = resolve(projectRoot, serveArg);
const rootDir = resolve(root);
const port = Number(process.env.PORT || (serveArg === "." ? 5173 : 4173));

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function resolveRequestPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const candidate = normalize(join(root, decoded === "/" ? "index.html" : decoded));
  const resolved = resolve(candidate);
  if (resolved !== rootDir && !resolved.startsWith(rootDir + sep)) {
    return null;
  }
  return resolved;
}

createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }
  let filePath;
  try {
    filePath = resolveRequestPath(req.url || "/");
  } catch {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }
  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const info = statSync(filePath);
    const finalPath = info.isDirectory() ? join(filePath, "index.html") : filePath;
    const size = statSync(finalPath).size;
    const headers = {
      "Content-Type": types[extname(finalPath).toLowerCase()] || "application/octet-stream",
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
      'Content-Length': size,
    };
    let start = 0;
    let end = size - 1;
    let status = 200;
    if (req.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      let valid = Boolean(range && (range[1] || range[2]) && size > 0);
      if (valid) {
        if (!range[1]) {
          const suffix = Number(range[2]);
          valid = Number.isSafeInteger(suffix) && suffix > 0;
          start = Math.max(0, size - suffix);
        } else {
          start = Number(range[1]);
          end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
          valid = Number.isSafeInteger(start) && Number.isSafeInteger(end) && start <= end && start < size;
        }
      }
      if (!valid) {
        res.writeHead(416, { 'Content-Range': `bytes */${size}`, 'Content-Length': 0 });
        res.end();
        return;
      }
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
      headers['Content-Length'] = end - start + 1;
    }
    res.writeHead(status, headers);
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    const stream = createReadStream(finalPath, size > 0 ? { start, end } : undefined);
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}/`);
});
