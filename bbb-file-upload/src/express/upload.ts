import { randomUUID } from 'node:crypto';
import { Request, Response } from 'express';
import config from '../config';
import { Logger } from '../common/logger';
import { detectImage, readDimensions } from '../upload/imageValidation';
import { isValidMeetingId, usedBytes, store } from '../upload/storage';

const logger = new Logger('upload');

const { limits } = config;
const quotaBytes = limits.quotaPerMeetingMb * 1024 * 1024;

// Identity of the requester, taken exclusively from the headers injected by the
// nginx auth_request (the browser cannot set them). meetingId scopes the write;
// the body is never trusted for it.
function identity(req: Request): { meetingId: string; userId: string } | null {
  const meetingId = req.header('meeting-id');
  const userId = req.header('user-id');
  if (typeof meetingId !== 'string' || typeof userId !== 'string' || !meetingId || !userId) {
    return null;
  }
  return { meetingId, userId };
}

export function handleUpload(req: Request, res: Response): void {
  const who = identity(req);
  if (!who || !isValidMeetingId(who.meetingId)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'no file provided' });
    return;
  }

  const detected = detectImage(file.buffer);
  if (!detected || !limits.allowedMimeTypes.includes(detected.mime)) {
    logger.warn('Rejected upload with disallowed content', {
      meetingId: who.meetingId,
      declared: file.mimetype,
      detected: detected?.mime ?? 'unknown',
    });
    res.status(415).json({ error: 'unsupported media type' });
    return;
  }

  const dimensions = readDimensions(file.buffer);
  if (!dimensions) {
    res.status(422).json({ error: 'could not read image dimensions' });
    return;
  }
  if (dimensions.width > limits.maxImageDimensionPx || dimensions.height > limits.maxImageDimensionPx) {
    logger.warn('Rejected oversized image', {
      meetingId: who.meetingId,
      width: dimensions.width,
      height: dimensions.height,
    });
    res.status(422).json({ error: 'image dimensions exceed the allowed maximum' });
    return;
  }

  if (usedBytes(who.meetingId) + file.size > quotaBytes) {
    logger.warn('Rejected upload exceeding meeting quota', { meetingId: who.meetingId });
    res.status(413).json({ error: 'meeting storage quota exceeded' });
    return;
  }

  const filename = `${randomUUID()}.${detected.ext}`;
  try {
    store(who.meetingId, filename, file.buffer);
  } catch (error) {
    logger.error('Failed to store upload', {
      meetingId: who.meetingId,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ error: 'failed to store file' });
    return;
  }

  const url = `/bigbluebutton/fileUpload/${who.meetingId}/${filename}`;
  logger.info('Stored upload', { meetingId: who.meetingId, userId: who.userId, url });
  res.status(201).json({ url });
}
