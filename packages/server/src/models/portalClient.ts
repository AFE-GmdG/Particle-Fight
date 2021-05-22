export type Client = {
  key: string;
};

export type UnknownClient = Client & {
  triedRandomUids: Set<number>;
};

export type KnownClient = Client & {
  name: string;
  uid: number;
};

export const isClient = (obj: any): obj is Client => typeof obj === "object" && "key" in obj;
export const isUnknownClient = (client: Client): client is UnknownClient => "triedRandomUids" in client;
export const isKnownClient = (client: Client): client is KnownClient => "name" in client && "uid" in client;

export type Sender = {
  name: string;
  uid: number;
};
