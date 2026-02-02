import { WebsocketRequestHandler } from "express-ws";
import { Logger } from "../common/logger";
import hocuspocus from "../hocuspocus";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";

interface WebsocketApi {
  collaboration: WebsocketRequestHandler
}

const logger = new Logger('express-websocket-api');

const rateLimiter = new RateLimiterMemory({
  points: 10, // Number of connection attempts allowed
  duration: 1, // Per 1 second
  blockDuration: 20, // Block for 60 seconds (1 minute) if exceeded
});

const websocketApi: WebsocketApi = {
  collaboration: async (websocket, request) => {
    logger.info('=== WebSocket Request Data ===');

    // The URL at this point is just the endpoint
    const url = new URL(request.url, `http://${request.headers.host}`);
    const sessionToken = url.searchParams.get('sessionToken');

    // Rate limit check based on sessionToken
    if (sessionToken) {
      try {
        await rateLimiter.consume(sessionToken);
      } catch (rateLimiterRes) {
        // Rate limit exceeded
        const rejRes = rateLimiterRes as RateLimiterRes;
        const msBeforeNext = rejRes.msBeforeNext || 0;
        const secondsRemaining = Math.ceil(msBeforeNext / 1000);

        logger.warn(`Rate limit exceeded for sessionToken: ${sessionToken}. Blocked for ${secondsRemaining} more seconds.`);

        websocket.close(4001, `Rate limit exceeded. Too many connection attempts. Try again in ${secondsRemaining} seconds.`);
        return;
      }
    }

    const context = {
      sessionToken,
      websocket,
    }
    hocuspocus.handleConnection(websocket, request, context);
  }
}

export { websocketApi };