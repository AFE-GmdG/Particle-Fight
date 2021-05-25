export type HelloRequestModel = {
  id: number;
  method: "hello";
};

export type HelloAgainRequestModel = {
  id: number;
  method: "helloAgain";
  key: string;
};

export type SetNameRequestModel = {
  id: number;
  method: "setName";
  name: string;
  uid: number;
};

export type RequestModel =
  HelloRequestModel
  | HelloAgainRequestModel
  | SetNameRequestModel;

export const isHelloAgainRequestModel = (request: RequestModel): request is HelloAgainRequestModel => request.method === "helloAgain";
export const isSetNameRequestModel = (request: RequestModel): request is SetNameRequestModel => request.method === "setName";
