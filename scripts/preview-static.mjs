import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep } from "node:path";

const root = resolve("dist");
const port = Number(process.env.ACPHOTOS_PREVIEW_PORT || 4322);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(`${root}${sep}`))
      throw Error("Invalid path");
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const body = await readFile(file);
    response.writeHead(200, {
      "content-type":
        mime[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream",
    });
    response.end(body);
  } catch {
    try {
      response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      response.end(await readFile(resolve(root, "404.html")));
    } catch {
      response.writeHead(404).end("Not found");
    }
  }
}).listen(port, "127.0.0.1");
