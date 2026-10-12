// Minimal static server for the Elsewhere demo — no dependencies.
// Start:  node server.js   (from the elsewhere-travel-app folder)
// Stop:   kill $(cat .server.pid)   or   taskkill //PID <pid> //F
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const ports = [5173, 5500, 8787, 3000, 8080];

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

function start(port) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let filePath = path.normalize(path.join(root, urlPath));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("Not found");
      }
      res.writeHead(200, {
        "Content-Type": mime[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      });
      res.end(data);
    });
  });

  server.on("error", () => {
    const next = ports[ports.indexOf(port) + 1];
    if (next) start(next);
    else {
      console.error("SERVING_FAILED: all preferred ports are busy");
      process.exit(1);
    }
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    fs.writeFileSync(path.join(root, ".server.pid"), String(process.pid));
    console.log("SERVING_AT " + url);
    console.log("PID " + process.pid);
  });
}

start(ports[0]);
