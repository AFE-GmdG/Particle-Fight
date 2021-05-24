export type HelloRequestModel = {
  id: number;
  method: "hello";
};

export type HelloAgainRequestModel = {
  id: number;
  method: "helloAgain";
  key: string;
};

export type RequestModel =
  HelloRequestModel
  | HelloAgainRequestModel;

export const isHelloAgainRequestModel = (request: RequestModel): request is HelloAgainRequestModel => request.method === "helloAgain";
