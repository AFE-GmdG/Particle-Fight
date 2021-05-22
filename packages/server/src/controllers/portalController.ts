import ws from "ws";

type Client = {
  valid: boolean;
  name?: string;
  uid?: number;
  triedRandomUids?: Set<number>;
};

type HelloModel = {
  method: "hello";
  id: number;
};

type GetRandomUidModel = {
  method: "getRandomUid";
  id: number;
};

type SetNameModel = {
  method: "setName";
  id: number;
  name: string;
  uid: number;
};

type KnownModel =
  HelloModel
  | GetRandomUidModel
  | SetNameModel;

const isHelloModel = (knownModel: KnownModel): knownModel is HelloModel => knownModel.method === "hello";
const isGetRandomUidModel = (knownModel: KnownModel): knownModel is GetRandomUidModel => knownModel.method === "getRandomUid";
const isSetNameModel = (knownModel: KnownModel): knownModel is SetNameModel => knownModel.method === "setName";
const isKnownModel = (obj: any): obj is KnownModel => (
  "id" in obj
  && typeof obj.id === "number"
  && "method" in obj
  && (
    obj.method === "hello"
    || obj.method === "getRandomUid"
    || obj.method === "setName"
  ));

type OkResponseModel = {
  method: "ok";
  id: number;
};

type FailedResponseModel = {
  method: "failed";
  id: number;
  reason: string;
};

type GetRandomUidResponseModel = {
  method: "getRandomUid";
  id: number;
  uid: number;
};

type SetNameResponseModel = {
  method: "setName";
  name: string;
  uid: number;
};

type LeaveResponseModel = {
  method: "leave";
  name: string;
  uid: number;
};

type ServerShutdownResponseModel = {
  method: "shutdown";
};

type ResponseModel =
  OkResponseModel
  | FailedResponseModel
  | GetRandomUidResponseModel
  | SetNameResponseModel
  | LeaveResponseModel
  | ServerShutdownResponseModel;

const knownClients = new Map<ws, Client>();

const sendAll = (self: ws | null, message: ResponseModel, filter: ((client: Client) => boolean) | undefined = undefined) => {
  const myself = self && knownClients.get(self)!;
  const from = myself && `${myself.name}#${myself.uid}`;

  knownClients.forEach((client, socket) => {
    if (filter && !filter(client)) {
      return;
    }
    socket.send(JSON.stringify({
      ...message,
      from,
    }));
  });
};

const sendSelf = (self: ws, message: ResponseModel) => {
  const myself = knownClients.get(self)!;
  const from = myself.name && myself.uid && `${myself.name}#${myself.uid}`;

  self.send(JSON.stringify({
    ...message,
    from,
  }));
};

const sendOthers = (self: ws, message: ResponseModel) => {
  const myself = knownClients.get(self)!;
  if (!myself.name || !myself.uid) {
    return;
  }
  const from = `${myself.name}#${myself.uid}`;

  knownClients.forEach((_client, socket) => {
    if (socket !== self) {
      socket.send(JSON.stringify({
        ...message,
        from,
      }));
    }
  });
};

const knownModelHandler = {
  hello: (self: ws, helloModel: KnownModel) => {
    if (!isHelloModel(helloModel)) return;
    const myself = knownClients.get(self)!;
    myself.valid = true;
    sendSelf(self, {
      method: "ok",
      id: helloModel.id,
    });
  },

  getRandomUid: (self: ws, getRandomUidModel: KnownModel) => {
    if (!isGetRandomUidModel(getRandomUidModel)) return;
    const { id } = getRandomUidModel;
    const myself = knownClients.get(self)!;
    if (!myself.valid) {
      sendSelf(self, {
        method: "failed",
        id,
        reason: "Myself isn't valid.",
      });
      return;
    }
    if (myself.name || myself.uid) {
      sendSelf(self, {
        method: "failed",
        id,
        reason: "You already set your name.",
      });
      return;
    }
    const start = 1000; // 10;
    const end = 10000; // 20;
    const triedRandomUids = myself.triedRandomUids || new Set();
    const otherClientUids = new Set(Array.from(knownClients, ([, client]) => client.uid));
    knownClients.forEach((client) => client.uid && triedRandomUids.add(client.uid));

    const freeKeys = Array
      .from({ length: end - start }, (_, k) => k + start)
      .filter((k) => !triedRandomUids.has(k) && !otherClientUids.has(k));

    if (!freeKeys.length) {
      sendSelf(self, {
        method: "failed",
        id,
        reason: "No more free keys.",
      });
      return;
    }

    const uid = freeKeys[Math.floor(Math.random() * freeKeys.length)];
    triedRandomUids.add(uid);
    myself.triedRandomUids = triedRandomUids;
    sendSelf(self, {
      method: "getRandomUid",
      id,
      uid,
    });
  },

  setName: (self: ws, setNameModel: KnownModel) => {
    if (!isSetNameModel(setNameModel)) return;
    const { id, name, uid } = setNameModel;
    const myself = knownClients.get(self)!;
    if (!myself.valid) {
      sendSelf(self, {
        method: "failed",
        id,
        reason: "Myself isn't valid.",
      });
      return;
    }
    if (myself.name || myself.uid) {
      sendSelf(self, {
        method: "failed",
        id,
        reason: "You already set your name.",
      });
      return;
    }
    myself.name = name;
    myself.uid = uid;
    sendSelf(self, {
      method: "ok",
      id,
    });
    sendOthers(self, {
      method: "setName",
      name,
      uid,
    });
  },

  leave: (self: ws) => {
    const { valid, name, uid } = knownClients.get(self)!;
    if (valid && name && uid) {
      sendOthers(self, {
        method: "leave",
        name,
        uid,
      });
    }
  },

  shutdown: () => {
    sendAll(null, { method: "shutdown" }, (client) => client.valid);
  },
};

export const portalServer = new ws.Server({ noServer: true });

portalServer.on("connection", (socket) => {
  knownClients.set(socket, { valid: false });

  socket.on("message", (message) => {
    try {
      if (typeof message !== "string") {
        return;
      }
      const json = JSON.parse(message);
      if (!isKnownModel(json)) {
        return;
      }
      knownModelHandler[json.method](socket, json);
    } catch {
      // Ignore any invalid data
    }
  });

  socket.on("close", (code, reason) => {
    console.log(`Closing Socket... Code: ${code}, Reason: ${reason}`);
    knownModelHandler.leave(socket);
    knownClients.delete(socket);
  });
});

export const onShutdown = () => {
  knownModelHandler.shutdown();
};
