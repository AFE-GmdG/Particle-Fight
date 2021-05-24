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
