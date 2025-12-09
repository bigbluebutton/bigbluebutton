import {
  useMemo,
} from 'react';
import useNotesLastUpdatedAt from './useNotesLastUpdatedAt';
import useNotesLastRead from './useNotesLastRead';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';

interface UseHasUnreadNotesProps {
  isNotesPanelOpened: boolean;
  skip?: boolean;
}

const useHasUnreadNotes = ({ isNotesPanelOpened, skip = false }: UseHasUnreadNotesProps) => {
  const NOTES_CONFIG = window.meetingClientSettings.public.notes;
  const { lastReadTimestamp } = useNotesLastRead();

  const isSharedNotesPinned = layoutSelectInput((i: Input) => i.sharedNotes?.isPinned ?? false);

  // Skip subscription when notes panel is open or pinned to avoid unnecessary updates
  const skipSubscription = isNotesPanelOpened || isSharedNotesPinned || skip;

  const lastUpdatedAtTimestamp = useNotesLastUpdatedAt(NOTES_CONFIG.id, { skip: skipSubscription });

  const hasChanges = useMemo(() => {
    if (!lastUpdatedAtTimestamp) return false;
    return lastUpdatedAtTimestamp > lastReadTimestamp;
  }, [lastUpdatedAtTimestamp, lastReadTimestamp]);

  const returnedValue = useMemo(() => {
    // There should be no unread notes if the notes panel is open
    if (isNotesPanelOpened) return false;

    // There should be no unread notes if the shared notes is pinned
    if (isSharedNotesPinned) return false;

    return hasChanges;
  }, [isNotesPanelOpened, isSharedNotesPinned, hasChanges]);
  return returnedValue;
};

export default useHasUnreadNotes;
