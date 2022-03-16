import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import PadsService from '/imports/ui/components/pads/service';
import Auth from '/imports/ui/services/auth';
import { Session } from 'meteor/session';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { isSharedNotesEnabled } from '/imports/ui/services/features';

const NOTES_CONFIG = Meteor.settings.public.notes;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

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
    { fields: { 'lockSettingsProps.disableNotes': 1 } },
  );

  if (user.locked) {
    return !meeting.lockSettingsProps.disableNotes;
  }

  return true;
};

const getLastRev = () => {
  const lastRev = Session.get('notesLastRev');
  if (!lastRev) return -1;

  return lastRev;
};

const setLastRev = () => {
  const rev = PadsService.getRev(NOTES_CONFIG.id);
  const lastRev = getLastRev();

  if (rev !== 0 && rev > lastRev) {
    Session.set('notesLastRev', rev);
  }
};

const hasUnreadNotes = (sidebarContentPanel) => {
  if (sidebarContentPanel === PANELS.SHARED_NOTES) return false;

  const rev = PadsService.getRev(NOTES_CONFIG.id);
  const lastRev = getLastRev();

  return rev !== 0 && rev > lastRev;
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

export default {
  ID: NOTES_CONFIG.id,
  toggleNotesPanel,
  hasPermission,
  isEnabled,
  setLastRev,
  getLastRev,
  hasUnreadNotes,
};
