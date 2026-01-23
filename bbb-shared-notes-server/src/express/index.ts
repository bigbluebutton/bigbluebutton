import express from "express";
import expressWebsockets from "express-ws";
import { Logger } from "../common/logger";
import path from "path";
import { documentApi } from "./rest-api";
import { websocketApi } from "./websocket-api";

const logger = new Logger('index.ts');

const startExpressApp = () => {
  // Setup your express instance using the express-ws extension
  const { app } = expressWebsockets(express());

  const runDevelopmentRoutes = () => {
    // Serve static files from sample directory (development only)
    if (process.env.NODE_ENV !== 'production') {
      app.use('/sample', express.static(path.join(__dirname, '../../sample')));
      logger.info('Sample files available at /sample');
    }
  }

  // Add middlewares
  app.use(express.json());
  app.use('/api/documents', express.raw({ type: 'application/octet-stream', limit: '10mb' }));

  // Websocket APIs
  app.ws("/collaboration", websocketApi.collaboration);

  // Rest APIs
  app.get("/api/documents/:documentName", documentApi.get);
  app.post("/api/documents/:documentName", documentApi.post);

  runDevelopmentRoutes();

  // Start the server
  app.listen(8787, () => console.log("Listening on http://127.0.0.1:8787"));
}

export { startExpressApp };
