import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';

const NOTE_CONFIG = Meteor.settings.public.note;

/**
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {boolean} [asString=false] set to true to return the hash value as
 *     8-digit hex string instead of an integer
 * @param {integer} [seed] optionally pass the hash of the previous chunk
 * @returns {integer | string}
 */
const hashFNV32a = (str, asString, seed) => {
  let hval = (seed === undefined) ? 0x811c9dc5 : seed;

  for (let i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  if (asString) {
    return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
  }
  return hval >>> 0;
}

const generateNoteId = () => {
  const meetingId = Auth.meetingID;
  const noteId = hashFNV32a(meetingId, true);
  return noteId;
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
}

const getNoteURL = () => {
  const noteId = generateNoteId();
  const params = getNoteParams();
  let url = NOTE_CONFIG.url + '/p/' + noteId + '?' + params;
  return url;
};

export default {
  getNoteURL,
};
