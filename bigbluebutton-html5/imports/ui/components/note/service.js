import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import Note from '/imports/api/note';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';
import { Session } from 'meteor/session';
import { ACTIONS, PANELS } from '../layout/enums';

const NOTE_CONFIG = Meteor.settings.public.note;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const getNoteId = () => {
  const note = Note.findOne({ meetingId: Auth.meetingID }, { fields: { noteId: 1 } });
  return note ? note.noteId : '';
};

const getReadOnlyNoteId = () => {
  const note = Note.findOne({ meetingId: Auth.meetingID }, { fields: { readOnlyNoteId: 1 } });
  return note ? note.readOnlyNoteId : '';
};

const getLang = () => {
  const { locale } = Settings.application;
  return locale ? locale.toLowerCase() : '';
};

const getNoteParams = () => {
  const config = {};
  const User = Users.findOne({ userId: Auth.userID }, { fields: { name: 1 } });
  config.userName = User.name;
  config.lang = getLang();
  config.rtl = document.documentElement.getAttribute('dir') === 'rtl';

  const params = Object.keys(config).map((key) => `${key}=${encodeURIComponent(config[key])}`).join('&');
  return params;
};

const isLocked = () => {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID }, { fields: { 'lockSettingsProps.disableNote': 1 } });
  const user = Users.findOne({ userId: Auth.userID }, { fields: { locked: 1, role: 1 } });

  if (meeting.lockSettingsProps && user.role !== ROLE_MODERATOR && user.locked) {
    return meeting.lockSettingsProps.disableNote;
  }
  return false;
};

const getReadOnlyURL = () => {
  const readOnlyNoteId = getReadOnlyNoteId();
  const params = getNoteParams();
  const url = Auth.authenticateURL(`${NOTE_CONFIG.url}/p/${readOnlyNoteId}?${params}`);
  return url;
};

const getNoteURL = () => {
  const noteId = getNoteId();
  const params = getNoteParams();
  const url = Auth.authenticateURL(`${NOTE_CONFIG.url}/p/${noteId}?${params}`);
  return url;
};

const getRevs = () => {
  const note = Note.findOne({ meetingId: Auth.meetingID }, { fields: { revs: 1 } });
  return note ? note.revs : 0;
};

const getLastRevs = () => {
  const lastRevs = Session.get('noteLastRevs');

  if (!lastRevs) return -1;
  return lastRevs;
};

const setLastRevs = (revs) => {
  const lastRevs = getLastRevs();

  if (revs !== 0 && revs > lastRevs) {
    Session.set('noteLastRevs', revs);
  }
};

const hasUnreadNotes = (sidebarContentPanel) => {
  if (sidebarContentPanel === PANELS.SHARED_NOTES) return false;

  const revs = getRevs();
  const lastRevs = getLastRevs();

  return (revs !== 0 && revs > lastRevs);
};

const isEnabled = () => {
  const note = Note.findOne({ meetingId: Auth.meetingID });
  return NOTE_CONFIG.enabled && note;
};

const toggleNotePanel = (sidebarContentPanel, newLayoutContextDispatch) => {
  newLayoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
    value: sidebarContentPanel !== PANELS.SHARED_NOTES,
  });
  newLayoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
    value: sidebarContentPanel === PANELS.SHARED_NOTES
      ? PANELS.NONE
      : PANELS.SHARED_NOTES,
  });
};

export default {
  getNoteURL,
  getReadOnlyURL,
  toggleNotePanel,
  isLocked,
  isEnabled,
  getRevs,
  setLastRevs,
  getLastRevs,
  hasUnreadNotes,
};
