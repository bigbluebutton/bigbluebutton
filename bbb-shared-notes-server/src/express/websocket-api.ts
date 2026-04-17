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
    logger.info('=== WebSocket Request Data ===');

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
    hocuspocus.handleConnection(websocket, request, context);
  }
}

export { websocketApi };