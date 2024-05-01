import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { isSharedNotesEnabled } from '/imports/ui/services/features';

const NOTES_CONFIG = window.meetingClientSettings.public.notes;

const isEnabled = () => isSharedNotesEnabled();

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

export default {
  ID: NOTES_CONFIG.id,
  toggleNotesPanel,
  isEnabled,
};
