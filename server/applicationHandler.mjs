import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export function createApplicationHandler({ api, staticRoot }) {
  const root = resolve(staticRoot);
  const indexPath = resolve(root, "index.html");
  return async function handle(request) {
    const url = new URL(request.url);
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) return api(request);
    if (!['GET', 'HEAD'].includes(request.method)) return response("Method not allowed.", 405, "text/plain; charset=utf-8");

    let pathname;
    try { pathname = decodeURIComponent(url.pathname); }
    catch { return response("Bad request.", 400, "text/plain; charset=utf-8"); }
    if (pathname.split("/").some((segment) => segment.startsWith("."))) {
      return response("Not found.", 404, "text/plain; charset=utf-8");
    }
    const requestedPath = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    if (requestedPath !== root && !requestedPath.startsWith(`${root}${sep}`)) {
      return response("Not found.", 404, "text/plain; charset=utf-8");
    }

    const requested = await readStaticFile(requestedPath);
    if (requested) return fileResponse(requested, requestedPath, request.method === "HEAD", pathname.startsWith("/assets/"));
    if (!extname(pathname)) {
      const index = await readStaticFile(indexPath);
      if (index) return fileResponse(index, indexPath, request.method === "HEAD", false);
    }
    return response("Not found.", 404, "text/plain; charset=utf-8");
  };
}

async function readStaticFile(path) {
  try { return await readFile(path); }
  catch (error) {
    if (["ENOENT", "EISDIR", "ENOTDIR"].includes(error?.code)) return null;
    throw error;
  }
}

function fileResponse(body, path, head, immutable) {
  return new Response(head ? null : body, {
    status: 200,
    headers: {
      "cache-control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
      "content-type": contentTypes[extname(path).toLowerCase()] ?? "application/octet-stream",
      "x-content-type-options": "nosniff",
    },
  });
}

function response(body, status, contentType) {
  return new Response(body, { status, headers: { "content-type": contentType, "x-content-type-options": "nosniff" } });
}
