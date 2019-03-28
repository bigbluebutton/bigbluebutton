import Users from '/imports/api/users';
import Note from '/imports/api/note';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';

const NOTE_CONFIG = Meteor.settings.public.note;

const getNoteId = () => {
  const meetingId = Auth.meetingID;
  const noteId = Note.findOne({ meetingId }).noteId;
  return noteId;
};

const getReadOnlyNoteId = () => {
  const meetingId = Auth.meetingID;
  const readOnlyNoteId = Note.findOne({ meetingId }).readOnlyNoteId;
  return readOnlyNoteId;
};

const getLang = () => {
  const locale = Settings.application.locale;
  const lang = locale.toLowerCase();
  return lang;
};

const getCurrentUser = () => {
  const userId = Auth.userID;
  const User = Users.findOne({ userId });
  return User;
};

const getNoteParams = () => {
  let config = NOTE_CONFIG.config;
  const User = getCurrentUser();
  config.userName = User.name;
  config.userColor = User.color;
  config.lang = getLang();

  let params = [];
  for (var key in config) {
    if (config.hasOwnProperty(key)) {
      params.push(key + '=' + encodeURIComponent(config[key]));
    }
  }
  return params.join('&');
};

const isLocked = () => {
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

export default {
  getNoteURL,
  getReadOnlyURL,
  isLocked,
};
