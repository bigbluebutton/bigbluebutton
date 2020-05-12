import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import Note from '/imports/api/note';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';
import { Session } from 'meteor/session';

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
  const { config } = NOTE_CONFIG;
  const User = Users.findOne({ userId: Auth.userID }, { fields: { name: 1, color: 1 } });
  config.userName = User.name;
  config.userColor = User.color;
  config.lang = getLang();

  const params = [];
  for (const key in config) {
    if (config.hasOwnProperty(key)) {
      params.push(`${key}=${encodeURIComponent(config[key])}`);
    }
  }
  return params.join('&');
};

const isLocked = () => {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID }, { fields: { 'lockSettingsProps.disableNote': 1 } });
  const user = Users.findOne({ userId: Auth.userID }, { fields: { locked: 1, role: 1 } });

  if (meeting.lockSettingsProps && user.role !== ROLE_MODERATOR) {
    return meeting.lockSettingsProps.disableNote;
  }
  return false;
};

const getReadOnlyURL = () => {
  const readOnlyNoteId = getReadOnlyNoteId();
  const url = Auth.authenticateURL(`${NOTE_CONFIG.url}/p/${readOnlyNoteId}`);
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

const isEnabled = () => {
  const note = Note.findOne({ meetingId: Auth.meetingID });
  return NOTE_CONFIG.enabled && note;
};

const toggleNotePanel = () => {
  Session.set(
    'openPanel',
    isPanelOpened() ? 'userlist' : 'note',
  );
};

const isPanelOpened = () => Session.get('openPanel') === 'note';

export default {
  getNoteURL,
  getReadOnlyURL,
  toggleNotePanel,
  isLocked,
  isEnabled,
  isPanelOpened,
  getRevs,
};
