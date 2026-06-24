import express from "express";
import { rateLimit } from 'express-rate-limit'
import expressWs from "express-ws";
import { Logger } from "../common/logger";
import config from "../config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { documentApi } from "./rest-api";
import { websocketApi } from "./websocket-api";
import { extractMeetingId } from "../hocuspocus/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = new Logger('index.ts');

const limiter = rateLimit({
	windowMs: (config.rateLimit.windowInSeconds as number) * 1000,
	limit: config.rateLimit.maxRequestsPerWindow,
	standardHeaders: true,
	legacyHeaders: false,
    message: 'Too many requests. Please slow down.',
    handler: (req, res, _next, options) => {
      logger.warn(`Rate limit exceeded for user: ${options.keyGenerator(req, res)}`);

      // Check if this is a WebSocket upgrade request
      const isWebSocket = req.headers.upgrade === 'websocket';

      if (isWebSocket) {
        // For WebSocket upgrade requests, send 429 with text response
        // The client will receive this as a connection error
        res.status(429)
           .set('Content-Type', 'text/plain')
           .send('Rate limit exceeded. Please slow down.')
           .end();
      } else {
        // For regular HTTP requests, send JSON response
        res.status(options.statusCode).json({ error: options.message }).end();
      }
    },
    keyGenerator: (req) => {
      const intUserId = req.headers['user-id'];
      const meetingId = req.headers['meeting-id'];
      if (typeof intUserId !== 'string' || typeof meetingId !== 'string') {
        return 'system';
      }
      return `${intUserId}-${meetingId}`;
    },
});

const startExpressApp = () => {
  // Setup your express instance using the express-ws extension
  const wsInstance = expressWs(express());
  const { app } = wsInstance;

  const wsServer = wsInstance.getWss();

  const maxSize = config.expressServer.maxContentLength * 1024; //kB

  wsServer.options.maxPayload = maxSize;

  wsServer.on("connection", (ws) => {
    ws.on("error", (err) => {
      logger.error("WS connection error:", {
        message: err.message,
        cause: err.cause,
      });
    });
  });

  const runDevelopmentRoutes = () => {
    // Serve static files from sample directory (development only)
    if (process.env.NODE_ENV !== 'production') {
      app.use('/sample', express.static(path.join(__dirname, '../../sample')));
      logger.info('Sample files available at /sample');
    }
  }

  // Add middlewares
  app.use(express.json());
  app.use(limiter);
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

  runDevelopmentRoutes();

  // Start the server
  const { host, port } = config.expressServer;
  app.listen(port, host, () => console.log(`Listening on http://${host}:${port}`));
}

export { startExpressApp };
