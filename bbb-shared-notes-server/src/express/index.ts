import express from "express";
import expressWebsockets from "express-ws";
import { Logger } from "../common/logger";
import { config } from "../config";
import path from "path";
import { documentApi } from "./rest-api";
import { websocketApi } from "./websocket-api";
import { extractMeetingId } from "../hocuspocus/utils";

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
  app.use('/api/documents/:documentName', (req, res, next) => {
    const meetingIdHeader = req.get('meeting-id');
    if (!meetingIdHeader) {
      next();
      return;
    }

    const { documentName } = req.params;
    const meetingIdFromUrl = extractMeetingId(documentName);

    if (meetingIdHeader !== meetingIdFromUrl) {
      logger.warn(`meeting-id header mismatch for ${req.originalUrl}`);
      res.sendStatus(403);
      return;
    }
    next();
  });

  // Websocket APIs
  app.ws("/collaboration", websocketApi.collaboration);

  // Rest APIs
  app.get("/api/documents/:documentName/export/:format", documentApi.export);
  app.get("/api/documents/:documentName", documentApi.get);
  app.post("/api/documents/:documentName", documentApi.post);

  runDevelopmentRoutes();

  // Start the server
  const { host, port } = config.expressServer;
  app.listen(port, host, () => console.log(`Listening on http://${host}:${port}`));
}

export { startExpressApp };
