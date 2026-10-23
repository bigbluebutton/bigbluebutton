import { randomUUID } from 'node:crypto';
import { Request, Response } from 'express';
import config from '../config';
import { Logger } from '../common/logger';
import {
  detectFileType, isImageMime, NAME_EXTENSIONS, readDimensions, resolveAllowedMimeTypes,
} from '../upload/imageValidation';
import { isValidMeetingId, usedBytes, store } from '../upload/storage';

const logger = new Logger('upload');

const { limits } = config;
const quotaBytes = limits.quotaPerMeetingMb * 1024 * 1024;

const { allowed: allowedMimeTypes, ignored } = resolveAllowedMimeTypes(limits.allowedMimeTypes);
if (ignored.length > 0) {
  logger.warn('Ignoring allowedMimeTypes the service cannot verify by signature', { ignored });
}

const MAX_NAME_LENGTH = 255;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

// The name the file is shown and downloaded as. It comes from the client, so it
// is reduced to a bare file name (no directories, no control characters) and is
// made to end in an extension of the type the content was detected as: a pdf
// must never be saved as "page.html". Display only - the stored file is a uuid.
export function displayName(original: string, mime: string, ext: string): string {
  const base = original.split(/[/\\]/).pop()!.replace(CONTROL_CHARS, '').trim();
  const nameExt = base.includes('.') ? base.split('.').pop()!.toLowerCase() : '';
  const hasTypeExt = (NAME_EXTENSIONS[mime] ?? [ext]).includes(nameExt);
  const stem = (hasTypeExt ? base.slice(0, -(nameExt.length + 1)) : base) || 'file';
  const suffix = hasTypeExt ? base.slice(-(nameExt.length + 1)) : `.${ext}`;
  return stem.slice(0, MAX_NAME_LENGTH - suffix.length) + suffix;
}

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
    res.status(401).json({ code: 'unauthorized' });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ code: 'no_file' });
    return;
  }

  const detected = detectFileType(file.buffer);
  if (!detected || !allowedMimeTypes.includes(detected.mime)) {
    logger.warn('Rejected upload with disallowed content', {
      meetingId: who.meetingId,
      declared: file.mimetype,
      detected: detected?.mime ?? 'unknown',
    });
    res.status(415).json({ code: 'unsupported_file_type' });
    return;
  }

  // The pixel cap only means something for images (it guards the consumers that
  // decode them); other types are bounded by the size limit alone.
  if (isImageMime(detected.mime)) {
    const dimensions = readDimensions(file.buffer);
    if (!dimensions) {
      res.status(422).json({ code: 'unreadable_dimensions' });
      return;
    }
    if (dimensions.width > limits.maxImageDimensionPx || dimensions.height > limits.maxImageDimensionPx) {
      logger.warn('Rejected oversized image', {
        meetingId: who.meetingId,
        width: dimensions.width,
        height: dimensions.height,
      });
      res.status(422).json({
        code: 'image_dimensions_exceed_maximum',
        maxWidth: limits.maxImageDimensionPx,
        maxHeight: limits.maxImageDimensionPx,
        sentWidth: dimensions.width,
        sentHeight: dimensions.height,
      });
      return;
    }
  }

  if (usedBytes(who.meetingId) + file.size > quotaBytes) {
    logger.warn('Rejected upload exceeding meeting quota', { meetingId: who.meetingId });
    res.status(413).json({ code: 'meeting_quota_exceeded' });
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
    res.status(500).json({ code: 'storage_failed' });
    return;
  }

  const url = `/bigbluebutton/fileUpload/${who.meetingId}/${filename}`;
  logger.info('Stored upload', { meetingId: who.meetingId, userId: who.userId, url });
  res.status(201).json({
    url,
    name: displayName(file.originalname ?? '', detected.mime, detected.ext),
    size: file.size,
    mime: detected.mime,
  });
}
