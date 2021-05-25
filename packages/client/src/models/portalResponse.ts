export type OkResponseModel = {
  id: number;
  method: "ok";
};

export type FailedResponseModel = {
  id: number;
  method: "failed";
  reason: string;
};

export type HelloResponseModel = {
  id: number;
  method: "hello";
  key: string;
  uid: number;
};

export type HelloAgainResponseModel = {
  id: number;
  method: "helloAgain";
  name: string;
  uid: number;
};

export type ResponseModel =
  OkResponseModel
  | FailedResponseModel
  | HelloResponseModel
  | HelloAgainResponseModel;

export const isOkResponseModel = (message: ResponseModel): message is OkResponseModel => message.method === "ok";
export const isFailedResponseModel = (message: ResponseModel): message is FailedResponseModel => message.method === "failed";
export const isHelloResponseModel = (message: ResponseModel): message is HelloResponseModel => message.method === "hello";
export const isHelloAgainResponseModel = (message: ResponseModel): message is HelloAgainResponseModel => message.method === "helloAgain";
export const isResponseModel = (obj: any): obj is ResponseModel => (
  typeof obj === "object"
  && "id" in obj
  && typeof obj.id === "number"
  && "method" in obj
  && (
    obj.method === "ok"
    || obj.method === "failed"
    || obj.method === "hello"
    || obj.method === "helloAgain"
  )
);
