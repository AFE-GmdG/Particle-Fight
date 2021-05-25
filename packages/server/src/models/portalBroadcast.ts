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
};

export type BroadcastModel =
  ShutdownBroadcastModel
  | NewClientBroadcastModel
  | OfflineBroadcastModel
  | OnlineBroadcastModel
  | LogoutBroadcastModel
  | ChatBroadcastModel;
