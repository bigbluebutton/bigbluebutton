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

const getLastRev = () => (Session.get('notesLastRev') || 0);

const getRev = () => PadsService.getRev(NOTES_CONFIG.id);

const markNotesAsRead = () => Session.set('notesLastRev', getRev());

const hasUnreadNotes = () => (getRev() > getLastRev());

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

const pinSharedNotes = (pinned) => {
  PadsService.pinPad(NOTES_CONFIG.id, pinned);
};

const isSharedNotesPinned = () => {
  const pinnedPad = PadsService.getPinnedPad();
  return pinnedPad?.externalId === NOTES_CONFIG.id;
};

export default {
  ID: NOTES_CONFIG.id,
  toggleNotesPanel,
  hasPermission,
  isEnabled,
  markNotesAsRead,
  hasUnreadNotes,
  isSharedNotesPinned,
  pinSharedNotes,
};
