import {
  useEffect, useMemo, useState, useCallback,
} from 'react';
import useNotesLastUpdatedAt from './useNotesLastUpdatedAt';
import useNotesLastRead from './useNotesLastRead';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import { PANELS } from '/imports/ui/components/layout/enums';

const useHasUnreadNotes = () => {
  const NOTES_CONFIG = window.meetingClientSettings.public.notes;
  const { lastReadTimestamp } = useNotesLastRead();
  const [hasChanges, setHasChanges] = useState(false);
  const [isLatched, setIsLatched] = useState(false);

  const { sidebarContentPanel, isSharedNotesPinned = false } = layoutSelectInput((i: Input) => ({
    sidebarContentPanel: i.sidebarContent?.sidebarContentPanel,
    isSharedNotesPinned: i.sharedNotes?.isPinned,
  }));
  const isPanelOpen = sidebarContentPanel === PANELS.SHARED_NOTES;

  // Skip subscription when notes panel is open or pinned to avoid unnecessary updates
  const skipSubscription = isPanelOpen || isSharedNotesPinned;

  const lastUpdatedAtTimestamp = useNotesLastUpdatedAt(NOTES_CONFIG.id, { skip: skipSubscription || isLatched });

  useEffect(() => {
    if (skipSubscription || isLatched || !lastUpdatedAtTimestamp) return;

    if (lastUpdatedAtTimestamp > lastReadTimestamp) {
      setIsLatched(true);
      setHasChanges(true);
    }
  }, [lastUpdatedAtTimestamp, lastReadTimestamp, isLatched, skipSubscription]);

  // Reset latch when panel opens
  const resetLatch = useCallback(() => {
    setIsLatched(false);
    setHasChanges(false);
  }, []);

  useEffect(() => {
    if (skipSubscription && (isLatched || hasChanges)) {
      resetLatch();
    }
  }, [skipSubscription, isLatched, hasChanges, resetLatch]);

  return useMemo(() => {
    // There should be no unread notes if the notes panel is open
    if (isPanelOpen) return false;

    // There should be no unread notes if the shared notes is pinned
    if (isSharedNotesPinned) return false;

    return hasChanges;
  }, [isPanelOpen, isSharedNotesPinned, hasChanges]);
};

export default useHasUnreadNotes;
