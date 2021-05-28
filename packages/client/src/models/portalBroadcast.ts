import { Sender } from "./portalClient";

export type ShutdownBroadcastModel = {
  broadcast: "shutdown";
};

export type NewClientBroadcastModel = {
  broadcast: "newClient";
  sender: Sender;
};

export type OfflineBroadcastModel = {
  broadcast: "offline";
  sender: Sender;
};

export type OnlineBroadcastModel = {
  broadcast: "online";
  sender: Sender;
};

export type LogoutBroadcastModel = {
  broadcast: "logout";
  sender: Sender;
};

export type ChatBroadcastModel = {
  broadcast: "chat";
  sender: Sender;
  messageTime: number;
  messageText: string;
};

export type BroadcastModel =
  ShutdownBroadcastModel
  | NewClientBroadcastModel
  | OfflineBroadcastModel
  | OnlineBroadcastModel
  | LogoutBroadcastModel
  | ChatBroadcastModel;

export const isShutdownBroadcastModel = (model: BroadcastModel): model is ShutdownBroadcastModel => model.broadcast === "shutdown";
export const isNewClientBroadcastModel = (model: BroadcastModel): model is NewClientBroadcastModel => model.broadcast === "newClient";
export const isOfflineBroadcastModel = (model: BroadcastModel): model is OfflineBroadcastModel => model.broadcast === "offline";
export const isOnlineBroadcastModel = (model: BroadcastModel): model is OnlineBroadcastModel => model.broadcast === "online";
export const isLogoutBroadcastModel = (model: BroadcastModel): model is LogoutBroadcastModel => model.broadcast === "logout";
export const isChatBroadcastModel = (model: BroadcastModel): model is ChatBroadcastModel => model.broadcast === "chat";
export const isBroadcastModel = (obj: any): obj is BroadcastModel => (
  typeof obj === "object"
  && "broadcast" in obj
  && (
    obj.broadcast === "shutdown"
    || obj.broadcast === "newClient"
    || obj.broadcast === "offline"
    || obj.broadcast === "online"
    || obj.broadcast === "logout"
    || obj.broadcast === "chat"
  )
);
