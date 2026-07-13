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
// has copied them. bbb-web drops this marker file in the uploads directory at
// meeting end for recorded meetings (the archive may only start long after
// that, even past retentionMinutes) and the archive removes it once its copy
// succeeds; until then, cleanup defers instead of racing the archive.
function isOnRecordingHold(dir: string): boolean {
  return fs.existsSync(path.join(dir, recordingHoldMarker));
}

export function deleteUploads(meetingId: string): void {
  const dir = uploadsDir(meetingId);
  if (!fs.existsSync(dir)) {
    return;
  }
  if (isOnRecordingHold(dir)) {
    // The archive still holds these uploads. Re-arm cleanup for another
    // retentionMinutes rather than abandoning the one-shot timer, otherwise the
    // directory would leak until a restart's residual scan re-armed it. Going
    // back through scheduleCleanup keeps the deferral on the same timer and
    // never fires immediately, so this cannot become a tight loop.
    logger.info('Skipping cleanup, uploads are on recording hold', { meetingId });
    scheduleCleanup(meetingId);
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
  // unref so a pending cleanup timer never keeps the process alive on its own:
  // the express server and redis subscriber hold it up in production, and a
  // stray timer would otherwise stall a graceful shutdown (or a test run).
  setTimeout(() => deleteUploads(meetingId), retentionMinutes * 60 * 1000).unref();
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
