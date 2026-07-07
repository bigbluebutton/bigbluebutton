import fs from 'node:fs';
import path from 'node:path';
import config from '../config';
import { Logger } from '../common/logger';
import { uploadsDir, isValidMeetingId } from '../upload/storage';
import { getActiveMeetingIds } from '../upload/activeMeetings';

const logger = new Logger('cleanup');

const { basePath } = config.storage;
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

// The cleanup timer above lives only in memory: if the service crashes or is
// restarted between a meeting ending and its timer firing, the timer is lost and
// the uploads directory leaks forever. Given the set of currently running
// meetings, returns the ids of the on-disk uploads directories whose meeting is
// no longer running, so their cleanup can be re-armed. Meetings that are still
// running are left untouched.
export function residualMeetingsToClean(activeMeetingIds: Set<string>): string[] {
  if (!fs.existsSync(basePath)) {
    return [];
  }
  const stale: string[] = [];
  for (const entry of fs.readdirSync(basePath, { withFileTypes: true })) {
    // The base directory holds more than uploads (recordings, presentations),
    // so a meeting only counts here if it has an uploads directory of ours.
    if (!entry.isDirectory() || !isValidMeetingId(entry.name)) {
      continue;
    }
    const meetingId = entry.name;
    if (activeMeetingIds.has(meetingId) || !fs.existsSync(uploadsDir(meetingId))) {
      continue;
    }
    stale.push(meetingId);
  }
  return stale;
}

// Startup recovery: re-arm cleanup for uploads left behind by ended meetings
// whose in-memory timer was lost to a restart. Best-effort - if bbb-web cannot
// tell us which meetings are running, we skip rather than risk deleting the
// uploads of a live meeting.
export async function scanResidualUploads(): Promise<void> {
  const activeMeetingIds = await getActiveMeetingIds();
  if (activeMeetingIds === null) {
    logger.warn('Skipping residual uploads scan: could not determine active meetings');
    return;
  }
  const stale = residualMeetingsToClean(activeMeetingIds);
  for (const meetingId of stale) {
    logger.info('Re-arming cleanup for residual uploads of an ended meeting', { meetingId });
    scheduleCleanup(meetingId);
  }
  logger.info('Residual uploads scan complete', { rescheduled: stale.length });
}
