import express from "express";
import expressWebsockets from "express-ws";
import { loadConfiguration } from "./config";
import startRedis from "./redis/subscriber";
import { startPostgres } from "./database/bbb-postgres";
import hocuspocus from "./hocuspocus";

loadConfiguration();
startRedis();
startPostgres();

// Setup your express instance using the express-ws extension
const { app } = expressWebsockets(express());

app.ws("/collaboration", async (websocket, request) => {
  console.log('=== WebSocket Request Data ===');

  // The URL at this point is just the endpoint
  const url = new URL(request.url, `http://${request.headers.host}`);
  const sessionToken = url.searchParams.get('sessionToken');

  console.log('teste aqui -- no websocket-> ', sessionToken);
  const context = {
    sessionToken,
    websocket,
  }
  hocuspocus.handleConnection(websocket, request, context);
});

// Start the server
app.listen(8787, () => console.log("Listening on http://127.0.0.1:8787"));