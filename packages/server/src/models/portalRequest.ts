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

export type ChatRequestModel = {
  id: number;
  method: "chat";
  message: string;
};

export type RequestModel =
  HelloRequestModel
  | HelloAgainRequestModel
  | SetNameRequestModel
  | ChatRequestModel;

export const isHelloRequestModel = (requestModel: RequestModel): requestModel is HelloRequestModel => requestModel.method === "hello";
export const isHelloAgainRequestModel = (requestModel: RequestModel): requestModel is HelloAgainRequestModel => requestModel.method === "helloAgain";
export const isSetNameRequestModel = (requestModel: RequestModel): requestModel is SetNameRequestModel => requestModel.method === "setName";
export const isChatRequestModel = (requestModel: RequestModel): requestModel is ChatRequestModel => requestModel.method === "chat";
export const isRequestModel = (obj: any): obj is RequestModel => (
  typeof obj === "object"
  && "id" in obj
  && typeof obj.id === "number"
  && "method" in obj
  && (
    obj.method === "hello"
    || obj.method === "helloAgain"
    || obj.method === "setName"
    || obj.method === "chat"
  )
);
