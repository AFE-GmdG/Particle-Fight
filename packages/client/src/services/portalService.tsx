import React from "react";
import { useHistory } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { KnownClient, Myself, MyselfBeforeLogin } from "../models/portalClient";
import { ChatMessage } from "../models/portalChat";
import {
  HelloRequestModel,
  HelloAgainRequestModel,
  SetNameRequestModel,
  ChatRequestModel,
  RequestModel,
  isHelloAgainRequestModel,
  isSetNameRequestModel,
} from "../models/portalRequest";
import {
  ResponseModel,
  isResponseModel,
  isOkResponseModel,
  isFailedResponseModel,
  isHelloResponseModel,
  isHelloAgainResponseModel,
} from "../models/portalResponse";
import {
  BroadcastModel,
  isBroadcastModel,
  isChatBroadcastModel,
  isLogoutBroadcastModel,
  isNewClientBroadcastModel,
  isOfflineBroadcastModel,
  isOnlineBroadcastModel,
  isShutdownBroadcastModel,
} from "../models/portalBroadcast";

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
  lastChatMessage: ChatMessage | null;
  getRandomUid: () => Promise<number>;
  setName: (userName: string, uid: number) => Promise<Myself>;
  chat: (message: string) => Promise<void>;
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
  lastChatMessage: null,
  getRandomUid: asyncReject,
  setName: asyncReject,
  chat: asyncReject,
};

const PortalContext = React.createContext(portalContextData);

export const PortalServiceProvider: React.FC = ({ children }) => {
  const mounted = React.useRef(false);
  // Handle mounted reference
  React.useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const history = useHistory();

  const [, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [, setConnected] = React.useState(false);
  const [, setTryReconnect] = React.useState(false);
  const [reconnectInProgress, setReconnectInProgress] = React.useState(false);
  const [myself, setMyself] = React.useState<Myself | MyselfBeforeLogin | null>(null);
  const [knownClients, setKnownClients] = React.useState<KnownClient[]>([]);
  const [lastChatMessage, setLastChatMessage] = React.useState<ChatMessage | null>(null);

  const requests = React.useMemo(() => new Map<number, RequestData>(), []);
  const [, setMessageId] = React.useState(0);

  const webSocketUrl = React.useMemo(() => {
    const { protocol, hostname, port } = window.location;
    const url = `${protocol === "http:" ? "ws://" : "wss://"}${hostname}${port === "3001" ? ":3000" : `:${port}`}/portal`;
    // console.log(`WebSocketUrl: [${url}]`);
    return url;
  }, []);
  const { readyState, lastMessage, sendMessage } = useWebSocket(webSocketUrl, {
    share: true,
    retryOnError: false,
    reconnectInterval: 1000,
    reconnectAttempts: 10,
    shouldReconnect: ((event) => {
      const { type, reason } = event;
      try {
        const message = JSON.parse(reason);
        if (isBroadcastModel(message) && isShutdownBroadcastModel(message)) {
          history.push("/no-server");
          return false;
        }
        console.warn(`ShouldReconnect: ${type} - [${reason}]`);
        return true;
      } catch {
        console.warn(`ShouldReconnect (Error): ${type} - [${reason}]`);
        return false;
      }
    }),
  });

  React.useEffect(() => {
    if (myself) {
      sessionStorage.setItem("key", myself.key);
    }
  }, [myself]);

  const sendHello = React.useCallback(() => (
    new Promise<MyselfBeforeLogin>((resolve, reject) => {
      setLoading(true);
      setMessageId((messageId) => {
        const id = messageId + 1;
        const request: HelloRequestModel = {
          method: "hello",
          id,
        };
        requests.set(id, [request, resolve, reject]);
        sendMessage(JSON.stringify(request));
        return id;
      });
    }).catch((ex) => {
      if (mounted.current && ex instanceof Error) {
        setError(ex);
      }
      throw ex;
    }).finally(() => {
      setLoading(false);
    })
  ), [requests, sendMessage]);

  const sendHelloAgain = React.useCallback((key: string) => (
    new Promise<Myself | MyselfBeforeLogin>((resolve, reject) => {
      setLoading(true);
      setMessageId((messageId) => {
        const id = messageId + 1;
        const request: HelloAgainRequestModel = {
          method: "helloAgain",
          id,
          key,
        };
        requests.set(id, [request, resolve, reject]);
        sendMessage(JSON.stringify(request));
        return id;
      });
    }).catch((ex) => {
      if (mounted.current && ex instanceof Error) {
        setError(ex);
      }
      throw ex;
    }).finally(() => {
      setLoading(false);
    })
  ), [requests, sendMessage]);

  const setName = React.useCallback((name: string, uid: number) => (
    new Promise<Myself>((resolve, reject) => {
      setLoading(true);
      setMessageId((messageId) => {
        const id = messageId + 1;
        const request: SetNameRequestModel = {
          method: "setName",
          id,
          name,
          uid,
        };
        requests.set(id, [request, resolve, reject]);
        sendMessage(JSON.stringify(request));
        return id;
      });
    }).then((self) => {
      setMyself(self);
      return self;
    }).catch((ex) => {
      if (mounted.current && ex instanceof Error) {
        setError(ex);
      }
      throw ex;
    }).finally(() => {
      setLoading(false);
    })
  ), [requests, sendMessage]);

  const chat = React.useCallback((message: string) => (
    new Promise<void>((resolve, reject) => {
      setMessageId((messageId) => {
        const id = messageId + 1;
        const request: ChatRequestModel = {
          method: "chat",
          id,
          message,
        };
        requests.set(id, [request, resolve, reject]);
        sendMessage(JSON.stringify(request));
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
      resolve({ key: response.key, uid: response.uid });
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
      resolve({ key: response.key, uid: response.uid });
    },

    setName(request: RequestModel, response: ResponseModel, resolve: ResolveHandler, reject: RejectHandler) {
      if (!isSetNameRequestModel(request) || !myself || !myself.key) {
        reject(new Error("Invalid Request"));
        return;
      }
      if (!testResponse(request, response, reject)) return;
      if (!isOkResponseModel(response)) {
        reject(new Error("Invalid Response"));
        return;
      }
      resolve({ name: request.name, uid: request.uid, key: myself.key });
    },

    chat(request: RequestModel, response: ResponseModel, resolve: ResolveHandler, reject: RejectHandler) {
      if (!testResponse(request, response, reject)) return;
      if (!isOkResponseModel(response)) {
        reject(new Error("Invalid Response"));
        return;
      }
      resolve();
    },
  }), [myself]);

  const broadcastHandler = React.useMemo(() => ({
    shutdown() {
      history.push("/no-server");
    },

    newClient(message: BroadcastModel) {
      if (!isNewClientBroadcastModel(message)) return;
      const { name, uid } = message.sender;
      const knownClient: KnownClient = {
        name,
        uid,
        offline: false,
      };
      setKnownClients((clients) => {
        if (clients.find((client) => client.name === name && client.uid === uid)) {
          return clients;
        }
        return [...clients, knownClient];
      });
    },

    offline(message: BroadcastModel) {
      if (!isOfflineBroadcastModel(message)) return;
      const { name, uid } = message.sender;
      setKnownClients((clients) => {
        const knownClient = clients.find((client) => client.name === name && client.uid === uid);
        if (!knownClient) return clients;
        return clients.reduce<KnownClient[]>((acc, client) => {
          if (client.name === name && client.uid === uid) {
            acc.push({ ...client, offline: Date.now() });
          } else {
            acc.push(client);
          }
          return acc;
        }, []);
      });
    },

    online(message: BroadcastModel) {
      if (!isOnlineBroadcastModel(message)) return;
      const { name, uid } = message.sender;
      setKnownClients((clients) => {
        const knownClient = clients.find((client) => client.name === name && client.uid === uid);
        if (!knownClient) {
          return [...clients, { name, uid, offline: false }];
        }
        return clients.reduce<KnownClient[]>((acc, client) => {
          if (client.name === name && client.uid === uid) {
            acc.push({ ...client, offline: false });
          } else {
            acc.push(client);
          }
          return acc;
        }, []);
      });
    },

    logout(message: BroadcastModel) {
      if (!isLogoutBroadcastModel(message)) return;
      const { name, uid } = message.sender;
      setKnownClients((clients) => {
        const index = clients.findIndex((client) => client.name === name && client.uid === uid);
        if (index < 0) return clients;
        return [...clients.slice(0, index), ...clients.slice(index + 1)];
      });
    },

    chat(message: BroadcastModel) {
      if (!isChatBroadcastModel(message)) return;
      const { sender, messageTime, messageText } = message;
      setLastChatMessage({
        sender,
        messageTime,
        messageText,
      });
    },
  }), [myself]);

  // calculate the current portalService state
  const portalService = React.useMemo(() => {
    const connected = readyState === ReadyState.OPEN;
    setConnected(connected);

    const key = (myself === null && sessionStorage.getItem("key")) || null;

    const loading = !error && (!connected || myself === null);
    setLoading(loading);

    const tryReconnect = myself === null && key !== null;
    setTryReconnect(tryReconnect);

    const initialize = async () => {
      setReconnectInProgress(true);
      try {
        if (key === null) {
          const newMyself = await sendHello();
          if (mounted.current) setMyself(newMyself);
        } else {
          const newMyself = await sendHelloAgain(key);
          if (mounted.current) setMyself(newMyself);
        }
        if (mounted.current) setReconnectInProgress(false);
      } catch (ex) {
        if (mounted.current) {
          if (ex instanceof Error) setError(ex);
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
      lastChatMessage,
      getRandomUid: asyncReject,
      setName,
      chat,
    };
  }, [
    error,
    myself,
    knownClients,
    readyState,
    reconnectInProgress,
    lastChatMessage,
    setName,
    chat,
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
      } else if (isBroadcastModel(response)) {
        // Broadcast handling
        broadcastHandler[response.broadcast](response);
      }
    } catch {
      // ignore
    }
  }, [requests, lastMessage]);

  return (
    <PortalContext.Provider value={portalService}>
      { React.Children.only(children)}
    </PortalContext.Provider>
  );
};

export default PortalContext;
