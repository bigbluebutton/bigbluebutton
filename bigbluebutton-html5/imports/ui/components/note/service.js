import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import Note from '/imports/api/note';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';
import mapUser from '/imports/ui/services/user/mapUser';
import { Session } from 'meteor/session';

const NOTE_CONFIG = Meteor.settings.public.note;

const getNoteId = () => {
  const note = Note.findOne({ meetingId: Auth.meetingID });
  return note ? note.noteId : '';
};

const getReadOnlyNoteId = () => {
  const note = Note.findOne({ meetingId: Auth.meetingID });
  return note ? note.readOnlyNoteId : '';
};

const getLang = () => {
  const { locale } = Settings.application;
  return locale ? locale.toLowerCase() : '';
};

const getCurrentUser = () => {
  const User = Users.findOne({ userId: Auth.userID });
  return User;
};

const getNoteParams = () => {
  const { config } = NOTE_CONFIG;
  const User = getCurrentUser();
  config.userName = User.name;
  config.userColor = User.color;
  config.lang = getLang();

  const params = [];
  for (const key in config) {
    if (config.hasOwnProperty(key)) {
      params.push(key + '=' + encodeURIComponent(config[key]));
    }
  }
  return params.join('&');
};

const isLocked = () => {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  const user = getCurrentUser();

  if (meeting.lockSettingsProps && mapUser(user).isLocked) {
    return meeting.lockSettingsProps.disableNote;
  }
  return false;
};

const getReadOnlyURL = () => {
  const readOnlyNoteId = getReadOnlyNoteId();
  const url = Auth.authenticateURL(NOTE_CONFIG.url + '/p/' + readOnlyNoteId);
  return url;
};

const getNoteURL = () => {
  const noteId = getNoteId();
  const params = getNoteParams();
  const url = Auth.authenticateURL(NOTE_CONFIG.url + '/p/' + noteId + '?' + params);
  return url;
};

const getRevs = () => {
  const note = Note.findOne({ meetingId: Auth.meetingID });
  return note ? note.revs : 0;
};

const isEnabled = () => {
  const note = Note.findOne({ meetingId: Auth.meetingID });
  return NOTE_CONFIG.enabled && note;
};

const isPanelOpened = () => {
  return Session.get('openPanel') === 'note';
};

export default {
  getNoteURL,
  getReadOnlyURL,
  isLocked,
  isEnabled,
  isPanelOpened,
  getRevs,
};
