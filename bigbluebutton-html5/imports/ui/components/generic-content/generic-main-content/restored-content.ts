import Auth from '/imports/ui/services/auth';
import Storage from '/imports/ui/services/storage/local';

// After a reload or a rejoin, plugins restore the main-area content they were
// showing. That is not a new share and must not eject the core content, so
// this browser remembers how many items were shown. One key for all meetings,
// so keys do not pile up.
const STORAGE_KEY = 'pluginMainAreaContentCount';
// Plugins restore their content soon after the client loads. Past this, the
// stored count is stale: the content was closed while the user was away.
const RESTORE_WINDOW_MS = 30000;

interface StoredCount {
  meetingId: string;
  count: number;
}

let pendingRestoreCount = 0;

export const endContentRestore = () => {
  pendingRestoreCount = 0;
};

export const startContentRestore = () => {
  const stored = Storage.getItem(STORAGE_KEY) as StoredCount | null;
  pendingRestoreCount = stored && stored.meetingId === Auth.meetingID ? stored.count : 0;
  const timeout = setTimeout(endContentRestore, RESTORE_WINDOW_MS);
  return () => clearTimeout(timeout);
};

// Stores the new item count and tells whether it adds content that was
// neither shown before nor is being restored
export const addsNewContent = (previousCount: number, count: number) => {
  const knownCount = Math.max(previousCount, pendingRestoreCount);
  if (count >= pendingRestoreCount) endContentRestore();
  const stored: StoredCount = { meetingId: Auth.meetingID as string, count };
  Storage.setItem(STORAGE_KEY, stored);
  return count > knownCount;
};
