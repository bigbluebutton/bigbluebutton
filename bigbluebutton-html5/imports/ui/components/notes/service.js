import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import PadsService from '/imports/ui/components/pads/service';
import Auth from '/imports/ui/services/auth';
import { Session } from 'meteor/session';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { isSharedNotesEnabled } from '/imports/ui/services/features';

const NOTES_CONFIG = window.meetingClientSettings.public.notes;
const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;

const hasPermission = () => {
  const user = Users.findOne(
    { userId: Auth.userID },
    {
      fields: {
        locked: 1,
        role: 1,
      },
    },
  );

  if (user.role === ROLE_MODERATOR) return true;

  const meeting = Meetings.findOne(
    { meetingId: Auth.meetingID },
    { fields: { 'lockSettings.disableNotes': 1 } },
  );

  if (user.locked) {
    return !meeting.lockSettings.disableNotes;
  }

  return true;
};


const isEnabled = () => isSharedNotesEnabled();

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

const pinSharedNotes = (pinned, stopWatching) => {
  PadsService.pinPad(NOTES_CONFIG.id, pinned, stopWatching);
};

export default {
  ID: NOTES_CONFIG.id,
  toggleNotesPanel,
  hasPermission,
  isEnabled,
  pinSharedNotes,
};
