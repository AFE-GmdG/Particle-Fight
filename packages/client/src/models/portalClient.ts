export type MyselfBeforeLogin = {
  key: string;
};

export type Myself = {
  name: string;
  uid: number;
  key: string;
};

export type Sender = {
  name: string;
  uid: number;
};

export type KnownClient = {
  name: string;
  uid: number;
  offline: false | number;
};
