import fs from 'node:fs';
import path from 'node:path';
import config from '../config';
import { Logger } from '../common/logger';
import { uploadsDir } from '../upload/storage';

const logger = new Logger('cleanup');

const { retentionMinutes, recordingHoldMarker } = config.cleanup;

// A recorded meeting keeps its uploads until the record-and-playback archive
// (phase 5) has copied them. The archive drops this marker file in the uploads
// directory while it works and removes it when done; until then, cleanup skips
// the directory instead of racing the archive.
function isOnRecordingHold(dir: string): boolean {
  return fs.existsSync(path.join(dir, recordingHoldMarker));
}

function deleteUploads(meetingId: string): void {
  const dir = uploadsDir(meetingId);
  if (!fs.existsSync(dir)) {
    return;
  }
  if (isOnRecordingHold(dir)) {
    logger.info('Skipping cleanup, uploads are on recording hold', { meetingId });
    return;
  }
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    logger.info('Deleted uploads for ended meeting', { meetingId });
  } catch (error) {
    logger.error('Failed to delete uploads', {
      meetingId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Schedules deletion of a meeting's uploads retentionMinutes after it ends.
export function scheduleCleanup(meetingId: string): void {
  logger.info('Scheduling uploads cleanup', { meetingId, retentionMinutes });
  setTimeout(() => deleteUploads(meetingId), retentionMinutes * 60 * 1000);
}
