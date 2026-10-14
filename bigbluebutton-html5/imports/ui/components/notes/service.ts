import { useIsSharedNotesEnabled } from '/imports/ui/services/features';

const useIsEnabled = () => useIsSharedNotesEnabled();

export const NOTES_ID = () => window.meetingClientSettings.public.notes.id;

export const NOTES_UNMOUNT_DELAY = () => window.meetingClientSettings.public.app.delayForUnmountOfSharedNote;

export const NOTES_ARE_PINNABLE = () => window.meetingClientSettings.public.notes.pinnable;

export default {
  useIsEnabled,
  NOTES_ID,
  NOTES_UNMOUNT_DELAY,
  NOTES_ARE_PINNABLE,
};
