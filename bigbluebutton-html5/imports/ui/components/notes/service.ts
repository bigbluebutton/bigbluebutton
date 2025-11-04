import meetingClientSettingsInitialValues from '/imports/ui/core/initial-values/meetingClientSettings';
import { useIsSharedNotesEnabled } from '/imports/ui/services/features';

const useIsEnabled = () => useIsSharedNotesEnabled();

export const NOTES_ID = () => (
  window.meetingClientSettings.public.notes.id
  ?? meetingClientSettingsInitialValues.public.notes.id
);

export const NOTES_UNMOUNT_DELAY = () => (
  window.meetingClientSettings.public.app.delayForUnmountOfSharedNote
  ?? meetingClientSettingsInitialValues.public.app.delayForUnmountOfSharedNote
);

export const NOTES_ARE_PINNABLE = () => (
  window.meetingClientSettings.public.notes.pinnable
  ?? meetingClientSettingsInitialValues.public.notes.pinnable
);

export default {
  useIsEnabled,
  NOTES_ID,
  NOTES_UNMOUNT_DELAY,
  NOTES_ARE_PINNABLE,
};
