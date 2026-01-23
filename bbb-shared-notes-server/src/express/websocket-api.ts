import { WebsocketRequestHandler } from "express-ws";
import { Logger } from "../common/logger";
import hocuspocus from "../hocuspocus";

interface WebsocketApi {
  collaboration: WebsocketRequestHandler
}

const logger = new Logger('express-websocket-api');

const websocketApi: WebsocketApi = {
  collaboration: async (websocket, request) => {
    logger.info('=== WebSocket Request Data ===');

    // The URL at this point is just the endpoint
    const url = new URL(request.url, `http://${request.headers.host}`);
    const sessionToken = url.searchParams.get('sessionToken');

    const context = {
      sessionToken,
      websocket,
    }
    hocuspocus.handleConnection(websocket, request, context);
  }
}

export { websocketApi };