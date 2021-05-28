import { Sender } from "./portalClient";

export type ChatMessage = {
  sender: Sender,
  messageTime: number,
  messageText: string,
};
