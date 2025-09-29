import meetingClientSettingsInitialValues from '/imports/ui/core/initial-values/meetingClientSettings';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { useIsSharedNotesEnabled } from '/imports/ui/services/features';

const useIsEnabled = () => useIsSharedNotesEnabled();

// @ts-ignore Until everything in Typescript
const toggleNotesPanel = (sidebarContentPanel, layoutContextDispatch) => {
  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
    value: sidebarContentPanel !== PANELS.SHARED_NOTES,
  });
  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
    value:
      sidebarContentPanel === PANELS.SHARED_NOTES
        ? PANELS.NONE
        : PANELS.SHARED_NOTES,
  });
};

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
  toggleNotesPanel,
  useIsEnabled,
  NOTES_ID,
  NOTES_UNMOUNT_DELAY,
  NOTES_ARE_PINNABLE,
};
