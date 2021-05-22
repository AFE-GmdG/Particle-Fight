export type OkResponseModel = {
  id: number;
  method: "ok";
};

export type FailedResponseModel = {
  id: number;
  method: "failed";
  reason: string;
};

export type OkWithKeyResponseModel = {
  id: number;
  method: "okWithKey";
  key: string;
};

export type ResponseModel =
  OkResponseModel
  | FailedResponseModel
  | OkWithKeyResponseModel;
