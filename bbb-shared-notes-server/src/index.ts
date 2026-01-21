import express from "express";
import expressWebsockets from "express-ws";
import { loadConfiguration } from "./config";
import startRedis from "./redis/subscriber";
import { startPostgres } from "./database/bbb-postgres";
import hocuspocus from "./hocuspocus";
import { Logger } from "./common/logger";

const logger = new Logger('index.ts');

loadConfiguration();
startRedis();
startPostgres();

// Setup your express instance using the express-ws extension
const { app } = expressWebsockets(express());

app.ws("/collaboration", async (websocket, request) => {
  logger.info('=== WebSocket Request Data ===');

  // The URL at this point is just the endpoint
  const url = new URL(request.url, `http://${request.headers.host}`);
  const sessionToken = url.searchParams.get('sessionToken');

  const context = {
    sessionToken,
    websocket,
  }
  hocuspocus.handleConnection(websocket, request, context);
});

// Start the server
app.listen(8787, () => console.log("Listening on http://127.0.0.1:8787"));