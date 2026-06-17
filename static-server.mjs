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
  const filePath = resolveRequestPath(req.url || "/");
  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const info = statSync(filePath);
    const finalPath = info.isDirectory() ? join(filePath, "index.html") : filePath;
    res.writeHead(200, {
      "Content-Type": types[extname(finalPath).toLowerCase()] || "application/octet-stream",
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    createReadStream(finalPath)
      .on("error", () => {
        if (!res.headersSent) res.writeHead(500);
        res.end("Server error");
      })
      .pipe(res);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}/`);
});
