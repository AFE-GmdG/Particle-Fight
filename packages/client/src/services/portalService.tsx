import React from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { KnownClient, Myself, MyselfBeforeLogin } from "../models/portalClient";
import { HelloRequestModel, HelloAgainRequestModel, RequestModel, isHelloAgainRequestModel } from "../models/portalRequest";
import { ResponseModel, isResponseModel, isFailedResponseModel, isHelloResponseModel, isHelloAgainResponseModel } from "../models/portalResponse";

type ResolveHandler = (value?: void | any | PromiseLike<void> | PromiseLike<any>) => void;
type RejectHandler = (reason?: any) => void;
type RequestData = [RequestModel, ResolveHandler, RejectHandler];

type PortalService = {
  loading: boolean;
  error: Error | null;
  connected: boolean;
  tryReconnect: boolean;
  myself: Myself | MyselfBeforeLogin | null;
  knownClients: KnownClient[];
  getRandomUid: () => Promise<number>;
  setName: (userName: string, uid: number) => Promise<void>;
};

function asyncReject<T = void>() {
  return Promise.reject<T>();
}

function testResponse(request: RequestModel, response: ResponseModel, reject: RejectHandler) {
  if (request.id !== response.id) {
    reject(new Error("RequestId != ResponeId: This should not happen!"));
    return false;
  }
  if (isFailedResponseModel(response)) {
    reject(new Error(response.reason));
    return false;
  }
  return true;
}

const portalContextData: PortalService = {
  loading: false,
  error: null,
  connected: false,
  tryReconnect: false,
  myself: null,
  knownClients: [],
  getRandomUid: asyncReject,
  setName: asyncReject,
};

const PortalContext = React.createContext(portalContextData);

export const PortalServiceProvider: React.FC = ({ children }) => {
  const mounted = React.useRef(false);

  const [, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [, setConnected] = React.useState(false);
  const [, setTryReconnect] = React.useState(false);
  const [reconnectInProgress, setReconnectInProgress] = React.useState(false);
  const [myself, setMyself] = React.useState<Myself | MyselfBeforeLogin | null>(null);
  console.warn("Render: ", myself);
  const [knownClients, _setKnownClients] = React.useState<KnownClient[]>([]);

  const requests = React.useMemo(() => new Map<number, RequestData>(), []);
  const [, setMessageId] = React.useState(0);

  const { protocol, hostname, port } = window.location;

  const { readyState, lastMessage, sendMessage } = useWebSocket(`${protocol === "http:" ? "ws://" : "wss://"}${hostname}${port === "3001" ? ":3000" : `:${port}`}/portal`, {
    share: true,
    retryOnError: false,
    reconnectInterval: 1000,
    reconnectAttempts: 10,
    shouldReconnect: ((event) => {
      console.warn(event);
      return true;
    }),
  });

  React.useEffect(() => {
    if (myself) {
      localStorage.setItem("key", myself.key);
    }
  }, [myself]);

  const sendHello = React.useCallback(() => (
    new Promise<MyselfBeforeLogin>((resolve, reject) => {
      setMessageId((messageId) => {
        const id = messageId + 1;
        const hello: HelloRequestModel = {
          method: "hello",
          id,
        };
        requests.set(id, [hello, resolve, reject]);
        sendMessage(JSON.stringify(hello));
        return id;
      });
    }).catch((ex) => {
      if (mounted.current && ex instanceof Error) {
        setError(ex);
      }
      throw ex;
    })
  ), [requests, sendMessage]);

  const sendHelloAgain = React.useCallback((key: string) => (
    new Promise<Myself | MyselfBeforeLogin>((resolve, reject) => {
      setMessageId((messageId) => {
        const id = messageId + 1;
        const helloAgain: HelloAgainRequestModel = {
          method: "helloAgain",
          id,
          key,
        };
        requests.set(id, [helloAgain, resolve, reject]);
        sendMessage(JSON.stringify(helloAgain));
        return id;
      });
    }).catch((ex) => {
      if (mounted.current && ex instanceof Error) {
        setError(ex);
      }
      throw ex;
    })
  ), [requests, sendMessage]);

  const responseHandler = React.useMemo(() => ({
    hello(request: RequestModel, response: ResponseModel, resolve: ResolveHandler, reject: RejectHandler) {
      if (!testResponse(request, response, reject)) return;
      if (!isHelloResponseModel(response)) {
        reject(new Error("Invalid Response"));
        return;
      }
      resolve({ key: response.key });
    },

    helloAgain(request: RequestModel, response: ResponseModel, resolve: ResolveHandler, reject: RejectHandler) {
      if (!isHelloAgainRequestModel(request)) {
        reject(new Error("Invalid Request"));
        return;
      }
      if (!testResponse(request, response, reject)) return;
      if (isHelloAgainResponseModel(response)) {
        resolve({ key: request.key, name: response.name, uid: response.uid });
        return;
      }
      if (!isHelloResponseModel(response)) {
        reject(new Error("Invalid Response"));
        return;
      }
      resolve({ key: response.key });
    },
  }), []);

  // calculate the current portalService state
  const portalService = React.useMemo(() => {
    const connected = readyState === ReadyState.OPEN;
    setConnected(connected);

    const key = (myself === null && localStorage.getItem("key")) || null;

    const loading = !error && (!connected || myself === null);
    setLoading(loading);

    const tryReconnect = myself === null && key !== null;
    setTryReconnect(tryReconnect);

    const initialize = async () => {
      console.warn("Initialize - setReconnectInProgress(true)");
      setReconnectInProgress(true);
      try {
        if (key === null) {
          const newMyself = await sendHello();
          if (mounted.current) setMyself(newMyself);
        } else {
          const newMyself = await sendHelloAgain(key);
          if (mounted.current) setMyself(newMyself);
          console.warn("setMyself:", newMyself);
        }
        console.warn("Initialize - setReconnectInProgress(false)");
        if (mounted.current) setReconnectInProgress(false);
      } catch (ex) {
        if (mounted.current) {
          if (ex instanceof Error) setError(ex);
          console.warn("Initialize Exception - setReconnectInProgress(false)");
          setReconnectInProgress(false);
        }
      }
    };

    if (!reconnectInProgress && myself === null) {
      initialize();
    }

    return {
      loading,
      error,
      connected,
      tryReconnect,
      myself,
      knownClients,
      getRandomUid: asyncReject,
      setName: asyncReject,
    };
  }, [
    error,
    myself,
    knownClients,
    readyState,
    reconnectInProgress,
  ]);

  // Handle incomming messages
  React.useEffect(() => {
    if (!lastMessage) return;

    try {
      const response = JSON.parse(lastMessage.data);
      if (isResponseModel(response)) {
        const { id } = response;
        const [request, resolve, reject] = requests.get(id) || [null, null, null];
        if (!request || !resolve || !reject) return;
        responseHandler[request.method](request, response, resolve, reject);
      }
    } catch {
      // ignore
    }
  }, [requests, lastMessage]);

  // Handle mounted reference
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <PortalContext.Provider value={portalService}>
      { React.Children.only(children)}
    </PortalContext.Provider>
  );
};

export default PortalContext;
