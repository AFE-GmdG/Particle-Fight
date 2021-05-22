import React from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { usePortalStore } from "../store";

export type Client = {
  name: string;
  uid: number;
};

// type SendMessage = (message: string) => void;

type HelloModel = {
  method: "hello";
  id: number;
};

type GetRandomUidModel = {
  method: "getRandomUid";
  id: number;
};

type SetNameModel = {
  method: "setName";
  id: number;
  name: string;
  uid: number;
};

type RequestModel =
  HelloModel
  | GetRandomUidModel
  | SetNameModel;

const isSetNameModel = (requestModel: RequestModel): requestModel is SetNameModel => requestModel.method === "setName";

type OkResponseModel = {
  method: "ok";
  id: number;
};

type FailedResponseModel = {
  method: "failed";
  id: number;
  reason: string;
};

type GetRandomUidResponseModel = {
  method: "getRandomUid";
  id: number;
  uid: number;
};

type ResponseModel =
  OkResponseModel
  | FailedResponseModel
  | GetRandomUidResponseModel;

const isOkResponseModel = (message: ResponseModel): message is ResponseModel => message.method === "ok";
const isFailedResponseModel = (message: ResponseModel): message is FailedResponseModel => message.method === "failed";
const isGetRandomUidResponseModel = (message: ResponseModel): message is GetRandomUidResponseModel => message.method === "getRandomUid";
const isResponeModel = (obj: any): obj is ResponseModel => (
  "id" in obj
  && typeof obj.id === "number"
  && "method" in obj
  && (
    obj.method === "ok"
    || obj.method === "failed"
    || obj.method === "getRandomUid"
  ));

type ResolveHandler = (value?: void | any | PromiseLike<void> | PromiseLike<any>) => void;
type RejectHandler = (reason?: any) => void;
type RequestData = [RequestModel, ResolveHandler, RejectHandler];

function assertId(test: boolean, reject: RejectHandler) {
  if (!test) {
    const error = new Error("RequestId != ResponeId: This should not happen!");
    reject(error);
  }
}

export const usePortalService = () => {
  const mounted = React.useRef(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [connected, setConnected] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  const [myself, setMyself] = usePortalStore((state) => state.myself);
  const [knownClients, _setKnownClients] = usePortalStore((state) => state.knownClients);
  const requests = React.useMemo(() => new Map<number, RequestData>(), []);

  const [, setMessageId] = React.useState(0);
  const { readyState, lastMessage, sendMessage } = useWebSocket("ws://localhost:3000/portal", {
    share: true,
    retryOnError: false,
    reconnectInterval: 500,
    reconnectAttempts: 3,
    shouldReconnect: ((event) => {
      console.warn(event);
      return true;
    }),
  });

  const responseHandler = React.useMemo(() => ({
    hello: (request: RequestModel, response: ResponseModel, resolve: ResolveHandler, reject: RejectHandler) => {
      assertId(request.id === response.id, reject);
      if (isFailedResponseModel(response)) {
        reject(new Error(response.reason));
        return;
      }
      if (!isOkResponseModel(response)) {
        reject(new Error("Invalid response"));
        return;
      }
      resolve();
    },

    getRandomUid: (request: RequestModel, response: ResponseModel, resolve: ResolveHandler, reject: RejectHandler) => {
      assertId(request.id === response.id, reject);
      if (isFailedResponseModel(response)) {
        reject(new Error(response.reason));
        return;
      }
      if (!isGetRandomUidResponseModel(response)) {
        reject(new Error("Invalid response"));
        return;
      }
      resolve(response.uid);
    },

    setName: (request: RequestModel, response: ResponseModel, resolve: ResolveHandler, reject: RejectHandler) => {
      if (!isSetNameModel(request)) {
        reject(new Error("Invalid request"));
        return;
      }
      const { name, uid } = request;
      assertId(request.id === response.id, reject);
      if (isFailedResponseModel(response)) {
        reject(new Error(response.reason));
        return;
      }
      if (!isOkResponseModel(response)) {
        reject(new Error("Invalid response"));
        return;
      }
      setMyself({ name, uid });
      resolve();
    },
  }), []);

  const sendHello = React.useCallback(() => {
    const promise = new Promise<void>((resolve, reject) => {
      setMessageId((currentMessageId) => {
        const id = currentMessageId + 1;
        const helloModel: HelloModel = {
          method: "hello",
          id,
        };
        requests.set(id, [helloModel, resolve, reject]);
        sendMessage(JSON.stringify(helloModel));
        return id;
      });
    });

    return promise.catch((ex) => {
      if (ex instanceof Error && mounted.current) {
        setError(ex);
      }
      throw ex;
    });
  }, [requests, sendMessage]);

  const getRandomUid = React.useCallback(() => {
    const promise = new Promise<number>((resolve, reject) => {
      setMessageId((currentMessageId) => {
        const id = currentMessageId + 1;
        const getRandomUidModel: GetRandomUidModel = {
          method: "getRandomUid",
          id,
        };
        requests.set(id, [getRandomUidModel, resolve, reject]);
        sendMessage(JSON.stringify(getRandomUidModel));
        return id;
      });
    });

    return promise.catch((ex) => {
      if (ex instanceof Error && mounted.current) {
        setError(ex);
      }
      throw ex;
    });
  }, [requests, sendMessage]);

  const setName = React.useCallback((name: string, uid: number) => {
    const promise = new Promise<void>((resolve, reject) => {
      setMessageId((currentMessageId) => {
        const id = currentMessageId + 1;
        const setNameModel: SetNameModel = {
          method: "setName",
          id,
          name,
          uid,
        };
        requests.set(id, [setNameModel, resolve, reject]);
        sendMessage(JSON.stringify(setNameModel));
        return id;
      });
    });

    return promise.catch((ex) => {
      if (ex instanceof Error && mounted.current) {
        setError(ex);
      }
      throw ex;
    });
  }, [requests, sendMessage]);

  // Handle mounted reference
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Handle incomming messages
  React.useEffect(() => {
    if (lastMessage === null) {
      return;
    }

    try {
      const responseModel = JSON.parse(lastMessage.data);
      if (isResponeModel(responseModel)) {
        const { id } = responseModel;
        const [request, resolve, reject] = requests.get(id) || [null, null, null];
        if (!request || !resolve || !reject) {
          return;
        }
        responseHandler[request.method](request, responseModel, resolve, reject);
      }
    } catch {
      // Ignore
    }
  }, [requests, lastMessage]);

  // Handle ReadyState Changes
  React.useEffect(() => {
    setConnected(readyState === ReadyState.OPEN);
  }, [readyState]);

  // Initialize Websocket
  React.useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);

      try {
        // Send Hello
        await sendHello();

        if (mounted.current) {
          setInitialized(true);
        }
      } catch (ex) {
        if (mounted.current) {
          setError(ex);
        }
      }
      if (mounted.current) {
        setLoading(false);
      }
    };

    if (!initialized) {
      initialize();
    }
  }, [initialized]);

  return {
    loading,
    error,
    connected,
    initialized,
    myself,
    knownClients,
    getRandomUid,
    setName,
  };
};
