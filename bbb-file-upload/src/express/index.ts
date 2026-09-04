import express from 'express';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import { Logger } from '../common/logger';
import config from '../config';
import { handleUpload } from './upload';

const logger = new Logger('express');

const maxFileSizeBytes = config.limits.maxFileSizeKb * 1024;

// Files are held in memory (capped by fileSize) so magic bytes and pixel
// dimensions can be validated before anything touches the disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSizeBytes, files: 1 },
});

// Rate limit keyed by user+meeting, using the headers injected by the nginx
// auth_request. Same 60/60s policy as the shared-notes server.
const limiter = rateLimit({
  windowMs: config.rateLimit.windowInSeconds * 1000,
  limit: config.rateLimit.maxRequestsPerWindow,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'rate_limited' },
  keyGenerator: (req) => {
    const userId = req.headers['user-id'];
    const meetingId = req.headers['meeting-id'];
    if (typeof userId !== 'string' || typeof meetingId !== 'string') {
      return 'system';
    }
    return `${userId}-${meetingId}`;
  },
});

// Every error response follows the same contract as handleUpload: a stable,
// machine-readable { code: '...' } body that the client maps to a localized
// message. The multer and rate-limit layers must not deviate from it.
export function createApp(): express.Express {
  const app = express();

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.post(
    '/upload',
    limiter,
    (req, res, next) => {
      upload.single('file')(req, res, (err: unknown) => {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(413).json({ code: 'file_too_large' });
            return;
          }
          res.status(400).json({ code: 'invalid_upload' });
          return;
        }
        if (err) {
          next(err);
          return;
        }
        handleUpload(req, res);
      });
    },
  );

  return app;
}

export function startExpressApp(): void {
  const { host, port } = config.expressServer;
  createApp().listen(port, host, () => logger.info(`Listening on http://${host}:${port}`));
}
