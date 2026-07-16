import { WebsocketRequestHandler } from "express-ws";
import { Logger } from "../common/logger";
import hocuspocus from "../hocuspocus";
import { getUserInformation, validateHeaderInformation } from "./utils";
import { handleSessionTokenConnectionLimiter } from "./handlers/sessionTokeConnectionLimiterHandler";

interface WebsocketApi {
  collaboration: WebsocketRequestHandler
}

const logger = new Logger('express-websocket-api');

const websocketApi: WebsocketApi = {
  collaboration: async (websocket, request) => {
    const isHeaderValid = validateHeaderInformation(request.headers);
    if (!isHeaderValid) {
      websocket.close(4001, 'User not authorized to connect');
      return null;
    }

    const userInformation = getUserInformation(request.headers);

    const url = new URL(request.url, `http://${request.headers.host}`);

    const sessionToken = url.searchParams.get('sessionToken') as string;

    handleSessionTokenConnectionLimiter(websocket, sessionToken);

    const context = {
      sessionToken,
      websocket,
      userInformation,
    }

    const requestHeaders = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => requestHeaders.append(key, v));
        } else {
          requestHeaders.set(key, value);
        }
      }
    }
    const webRequest = new Request(url.toString(), { headers: requestHeaders });

    // hocuspocus v4 no longer auto-wires WebSocket events in handleConnection.
    // We must manually forward message and close events to the ClientConnection.
    const clientConnection = hocuspocus.handleConnection(websocket, webRequest, context);

    websocket.on('message', (data: Buffer) => {
      clientConnection.handleMessage(new Uint8Array(data));
    });

    websocket.on('close', (code: number, reason: Buffer) => {
      clientConnection.handleClose({ code, reason: reason?.toString() });
    });
  }
}

export { websocketApi };