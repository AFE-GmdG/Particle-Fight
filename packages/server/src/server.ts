import http from "http";
import net from "net";
import path from "path";
import process from "process";
import url from "url";

import express from "express";

import logging from "./config/logging";
import { portalServer, onShutdown } from "./controllers/portalController";
import routes from "./routes";

const NAMESPACE = "Server";

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const router = express();

router.use((req, res, next) => {
  logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

  res.on("finish", () => {
    logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
  });

  next();
});

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.status(200).json({});
    return;
  }

  next();
});

router.use("/api", routes);
router.use("/", express.static(path.join(dirname, "client"), {
  dotfiles: "ignore",
  etag: true,
  extensions: false,
  index: "index.html",
}));

router.use((req, res, next) => {
  if ((req.method === "GET" || req.method === "HEAD") && req.accepts("html")) {
    res.sendFile(path.join(dirname, "client", "index.html"), (err) => err && next());
    return;
  }
  next();
});

router.use((_req, res) => {
  const error = new Error("Not found");
  res.status(404).json({ message: error.message });
});

const httpServer = http.createServer(router);

httpServer.listen(3000, () => logging.info(NAMESPACE, "Server is running on Port 3000"));
httpServer.on("upgrade", (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
  logging.info(NAMESPACE, `WebSocket Connection Upgrade: [${req.url}]`);
  if (req.url === "/portal") {
    portalServer.handleUpgrade(req, socket, head, (s) => {
      portalServer.emit("connection", s, req);
    });
    return;
  }

  socket.write(`HTTP/1.1 401 Web Socket Protocol Handshake
Upgrade: WebSocket
Connection: Upgrade

`);
  socket.destroy();
});

process.on("SIGINT", () => {
  logging.info(NAMESPACE, "Stopping Server");
  onShutdown();
  process.exit(0);
});
