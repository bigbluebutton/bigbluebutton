import fs from 'node:fs';
import path from 'node:path';
import config from '../config';

const { basePath, uploadsDirName } = config.storage;

// A meetingId only ever comes from the auth_request header (never from the
// request body), but it is still used to build a filesystem path, so we refuse
// anything that is not a plain BBB internal id. This is defence in depth against
// path traversal even if the upstream header were ever compromised.
const MEETING_ID_PATTERN = /^[A-Za-z0-9-]+$/;

export function isValidMeetingId(meetingId: string): boolean {
  return MEETING_ID_PATTERN.test(meetingId);
}

export function uploadsDir(meetingId: string): string {
  return path.join(basePath, meetingId, uploadsDirName);
}

// Sum of the bytes currently stored for a meeting. Directories are small
// (a handful of images), so a synchronous scan on each upload is cheap and
// avoids keeping a counter in sync with the filesystem.
export function usedBytes(meetingId: string): number {
  const dir = uploadsDir(meetingId);
  if (!fs.existsSync(dir)) {
    return 0;
  }
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile()) {
      total += fs.statSync(path.join(dir, entry.name)).size;
    }
  }
  return total;
}

// Writes the buffer atomically: a temp file in the same directory followed by a
// rename, so a serving nginx never sees a partially written file.
export function store(meetingId: string, filename: string, buffer: Buffer): string {
  const dir = uploadsDir(meetingId);
  fs.mkdirSync(dir, { recursive: true });
  const finalPath = path.join(dir, filename);
  const tmpPath = `${finalPath}.tmp`;
  fs.writeFileSync(tmpPath, buffer);
  fs.renameSync(tmpPath, finalPath);
  return finalPath;
}
