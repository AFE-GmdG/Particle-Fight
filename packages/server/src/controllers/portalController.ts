import crypto from "crypto";

import ws from "ws";

import logging from "../config/logging";

import { UnknownClient, KnownClient, OfflineClient } from "../models/portalClient";
import { BroadcastModel } from "../models/portalBroadcast";
import { RequestModel, isRequestModel, isHelloRequestModel, isHelloAgainRequestModel, isSetNameRequestModel } from "../models/portalRequest";
import { ResponseModel } from "../models/portalResponse";

const NAMESPACE = "PortalController";
const newClients = new Set<ws>();
const unknownClients = new Map<ws, UnknownClient>();
const knownClients = new Map<ws, KnownClient>();
const offlineClients = new Set<OfflineClient>();

export const portalServer = new ws.Server({ noServer: true });

function generateKey() {
  return crypto.randomBytes(32).toString("hex");
}

function generateRandomUid(self: ws) {
  const unknownClient = unknownClients.get(self);
  if (!unknownClient) throw new Error("GenerateRandomUid: No unknown client.");

  const start = 1000; // 10;
  const end = 10000; // 20;
  const { triedRandomUids } = unknownClient;
  const otherClientUids = new Set([
    ...Array.from(knownClients, ([, client]) => client.uid),
    ...Array.from(offlineClients, (client) => client.uid),
  ]);
  const freeKeys = Array
    .from({ length: end - start }, (_, k) => k + start)
    .filter((k) => !triedRandomUids.has(k) && !otherClientUids.has(k));
  if (!freeKeys.length) throw new Error("No more free keys.");
  const uid = freeKeys[Math.floor(Math.random() * freeKeys.length)];
  triedRandomUids.add(uid);
  return uid;
}

function sendResponse(self: ws, message: ResponseModel) {
  self.send(JSON.stringify(message));
}

function sendBroadcast(message: BroadcastModel): void;
function sendBroadcast(message: BroadcastModel, filter: (client: UnknownClient | KnownClient) => boolean): void;
function sendBroadcast(message: BroadcastModel, filter?: ((client: UnknownClient | KnownClient) => boolean)) {
  const msg = JSON.stringify(message);
  if (message.broadcast === "shutdown") {
    // Valid closing status codes: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#status_codes
    knownClients.forEach((_client, socket) => { socket.close(1000, msg); });
    knownClients.clear();
    unknownClients.forEach((_client, socket) => { socket.close(1000, msg); });
    unknownClients.clear();
    newClients.forEach((socket) => { socket.close(1000); });
    newClients.clear();
    return;
  }

  knownClients.forEach((client, socket) => {
    if (filter && !filter(client)) {
      return;
    }
    socket.send(msg);
  });

  // Only allow "newClient", "online" and "offline" messages to unknownClients:
  if (message.broadcast !== "newClient" && message.broadcast !== "online" && message.broadcast !== "offline") {
    return;
  }
  unknownClients.forEach((client, socket) => {
    if (filter && !filter(client)) {
      return;
    }
    socket.send(msg);
  });

  // No broadcast messages will be send to newClients
}

function offlineClientTimeoutHandler(key: string) {
  const offlineClient = Array.from(offlineClients).find((client) => client.key === key);
  if (!offlineClient) return;
  offlineClients.delete(offlineClient);
  sendBroadcast({ broadcast: "logout", sender: { name: offlineClient.name, uid: offlineClient.uid } });
}

const requestHandler = {
  hello(self: ws, request: RequestModel) {
    const { id } = request;
    // Check model type:
    if (!isHelloRequestModel(request)) {
      sendResponse(self, { method: "failed", id, reason: "Invalid request." });
      return;
    }
    // self must be in newClients:
    if (!newClients.delete(self)) {
      sendResponse(self, { method: "failed", id, reason: "You aren't a new client." });
      return;
    }
    // Generate key:
    const key = generateKey();
    unknownClients.set(self, { key, triedRandomUids: new Set() });
    try {
      const uid = generateRandomUid(self);
      sendResponse(self, {
        method: "hello",
        id,
        key,
        uid,
      });
    } catch (ex) {
      if (ex instanceof Error) {
        sendResponse(self, { method: "failed", id, reason: ex.message });
      }
    }
  },

  helloAgain(self: ws, request: RequestModel) {
    const { id } = request;
    // Check model type:
    if (!isHelloAgainRequestModel(request)) {
      sendResponse(self, { method: "failed", id, reason: "Invalid request." });
      return;
    }
    // self could be in offlineClients. If so - reenable:
    const offlineClient = Array.from(offlineClients).find((client) => client.key === request.key);
    if (offlineClient) {
      offlineClients.delete(offlineClient);
      const { timeoutHandle, ...knownClient } = offlineClient;
      clearTimeout(timeoutHandle);
      knownClients.set(self, knownClient);
      sendResponse(self, { method: "helloAgain", id, name: knownClient.name, uid: knownClient.uid });
      sendBroadcast({ broadcast: "online", sender: { name: knownClient.name, uid: knownClient.uid } });
      return;
    }
    // self wasn't in offlineClients - so it must be in newClients:
    if (!newClients.delete(self)) {
      sendResponse(self, { method: "failed", id, reason: "You aren't a new client." });
      return;
    }
    // Answer with a standard hello:
    const key = generateKey();
    unknownClients.set(self, { key, triedRandomUids: new Set() });
    try {
      const uid = generateRandomUid(self);
      sendResponse(self, {
        method: "hello",
        id,
        key,
        uid,
      });
    } catch (ex) {
      if (ex instanceof Error) {
        sendResponse(self, { method: "failed", id, reason: ex.message });
      }
    }
  },

  setName(self: ws, request: RequestModel) {
    const { id } = request;
    // Check model type:
    if (!isSetNameRequestModel(request)) {
      sendResponse(self, { method: "failed", id, reason: "Invalid request." });
      return;
    }
    // self must bei in unknownClients:
    const unknownClient = unknownClients.get(self);
    if (!unknownClient) {
      sendResponse(self, { method: "failed", id, reason: "You are not allowed to call setName." });
      return;
    }
    const { name, uid } = request;
    const knownClient: KnownClient = {
      name,
      uid,
      key: unknownClient.key,
    };
    unknownClients.delete(self);
    knownClients.set(self, knownClient);
    sendResponse(self, { method: "ok", id });
    sendBroadcast({ broadcast: "newClient", sender: { name, uid } });
  },
};

//   leave: (self: ws) => {
//     const { valid, name, uid } = knownClients.get(self)!;
//     if (valid && name && uid) {
//       sendOthers(self, {
//         method: "leave",
//         name,
//         uid,
//       });
//     }
//   },
// };

portalServer.on("connection", (socket) => {
  newClients.add(socket);

  socket.on("message", (message) => {
    try {
      if (typeof message !== "string") {
        return;
      }
      const json = JSON.parse(message);
      if (isRequestModel(json)) {
        requestHandler[json.method](socket, json);
        // return;
      }
      // knownModelHandler[json.method](socket, json);
    } catch {
      // Ignore any invalid data
    }
  });

  socket.on("close", (code, reason) => {
    logging.info(NAMESPACE, `Closing Socket... Code: ${code}, Reason: ${reason}`);
    const knownClient = knownClients.get(socket);
    unknownClients.delete(socket);
    newClients.delete(socket);
    if (knownClient) {
      sendBroadcast({ broadcast: "offline", sender: { name: knownClient.name, uid: knownClient.uid } });
      knownClients.delete(socket);
      const offlineClient: OfflineClient = {
        ...knownClient,
        timeoutHandle: setTimeout(offlineClientTimeoutHandler, 600000, knownClient.key), // 10min
      };
      offlineClients.add(offlineClient);
    }
  });
});

export const onShutdown = () => {
  sendBroadcast({ broadcast: "shutdown" });
};
