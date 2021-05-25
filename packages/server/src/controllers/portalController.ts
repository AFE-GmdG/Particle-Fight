import crypto from "crypto";

import ws from "ws";

import { UnknownClient, KnownClient } from "../models/portalClient";

import { BroadcastModel } from "../models/portalBroadcast";
import { RequestModel, isRequestModel, isHelloRequestModel, isHelloAgainRequestModel } from "../models/portalRequest";
import { ResponseModel } from "../models/portalResponse";

const newClients = new Set<ws>();
const unknownClients = new Map<ws, UnknownClient>();
const knownClients = new Map<ws, KnownClient>();
const offlineClients = new Set<KnownClient>();

export const portalServer = new ws.Server({ noServer: true });

function generateKey() {
  return crypto.randomBytes(32).toString("hex");
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

const requestHandler = {
  hello(self: ws, helloRequestModel: RequestModel) {
    const { id } = helloRequestModel;
    // Check model type:
    if (!isHelloRequestModel(helloRequestModel)) {
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
    sendResponse(self, {
      method: "hello",
      id,
      key,
    });
  },

  helloAgain(self: ws, helloAgainRequestModel: RequestModel) {
    const { id } = helloAgainRequestModel;
    // Check model type:
    if (!isHelloAgainRequestModel(helloAgainRequestModel)) {
      sendResponse(self, { method: "failed", id, reason: "Invalid request." });
      return;
    }
    // self could be in offlineClients. If so - reenable:
    const offlineClient = Array.from(offlineClients).find((client) => client.key === helloAgainRequestModel.key);
    if (offlineClient) {
      offlineClients.delete(offlineClient);
      knownClients.set(self, offlineClient);
      sendResponse(self, { method: "helloAgain", id, name: offlineClient.name, uid: offlineClient.uid });
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
    sendResponse(self, {
      method: "hello",
      id,
      key,
    });
  },
};

// const knownModelHandler = {
//   hello: (self: ws, helloModel: KnownModel) => {
//     if (!isHelloModel(helloModel)) return;
//     const myself = knownClients.get(self)!;
//     myself.valid = true;
//     sendSelf(self, {
//       method: "ok",
//       id: helloModel.id,
//     });
//   },

//   getRandomUid: (self: ws, getRandomUidModel: KnownModel) => {
//     if (!isGetRandomUidModel(getRandomUidModel)) return;
//     const { id } = getRandomUidModel;
//     const myself = knownClients.get(self)!;
//     if (!myself.valid) {
//       sendSelf(self, {
//         method: "failed",
//         id,
//         reason: "Myself isn't valid.",
//       });
//       return;
//     }
//     if (myself.name || myself.uid) {
//       sendSelf(self, {
//         method: "failed",
//         id,
//         reason: "You already set your name.",
//       });
//       return;
//     }
//     const start = 1000; // 10;
//     const end = 10000; // 20;
//     const triedRandomUids = myself.triedRandomUids || new Set();
//     const otherClientUids = new Set(Array.from(knownClients, ([, client]) => client.uid));
//     knownClients.forEach((client) => client.uid && triedRandomUids.add(client.uid));

//     const freeKeys = Array
//       .from({ length: end - start }, (_, k) => k + start)
//       .filter((k) => !triedRandomUids.has(k) && !otherClientUids.has(k));

//     if (!freeKeys.length) {
//       sendSelf(self, {
//         method: "failed",
//         id,
//         reason: "No more free keys.",
//       });
//       return;
//     }

//     const uid = freeKeys[Math.floor(Math.random() * freeKeys.length)];
//     triedRandomUids.add(uid);
//     myself.triedRandomUids = triedRandomUids;
//     sendSelf(self, {
//       method: "getRandomUid",
//       id,
//       uid,
//     });
//   },

//   setName: (self: ws, setNameModel: KnownModel) => {
//     if (!isSetNameModel(setNameModel)) return;
//     const { id, name, uid } = setNameModel;
//     const myself = knownClients.get(self)!;
//     if (!myself.valid) {
//       sendSelf(self, {
//         method: "failed",
//         id,
//         reason: "Myself isn't valid.",
//       });
//       return;
//     }
//     if (myself.name || myself.uid) {
//       sendSelf(self, {
//         method: "failed",
//         id,
//         reason: "You already set your name.",
//       });
//       return;
//     }
//     myself.name = name;
//     myself.uid = uid;
//     sendSelf(self, {
//       method: "ok",
//       id,
//     });
//     sendOthers(self, {
//       method: "setName",
//       name,
//       uid,
//     });
//   },

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
    console.log(`Closing Socket... Code: ${code}, Reason: ${reason}`);
    const knownClient = knownClients.get(socket);
    unknownClients.delete(socket);
    newClients.delete(socket);
    if (knownClient) {
      // knownModelHandler.leave(socket);
      knownClients.delete(socket);
      offlineClients.add(knownClient);
    }
  });
});

export const onShutdown = () => {
  sendBroadcast({ broadcast: "shutdown" });
};
