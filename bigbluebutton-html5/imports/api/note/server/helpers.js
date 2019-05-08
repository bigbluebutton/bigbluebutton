import { Meteor } from 'meteor/meteor';

const ETHERPAD = Meteor.settings.private.etherpad;
const NOTE_CONFIG = Meteor.settings.public.note;
const BASE_URL = `http://${ETHERPAD.host}:${ETHERPAD.port}/api/${ETHERPAD.version}`;

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
    return (`0000000${(hval >>> 0).toString(16)}`).substr(-8);
  }
  return hval >>> 0;
};

const createPadURL = padId => {
  return `${BASE_URL}/createPad?apikey=${ETHERPAD.apikey}&padID=${padId}`;
};

const getReadOnlyIdURL = padId => {
  return `${BASE_URL}/getReadOnlyID?apikey=${ETHERPAD.apikey}&padID=${padId}`;
};

const generateNoteId = meetingId => {
  const noteId = hashFNV32a(meetingId, true);
  return noteId;
};

const isEnabled = () => {
  return NOTE_CONFIG.enabled;
};

export {
  generateNoteId,
  createPadURL,
  getReadOnlyIdURL,
  isEnabled,
};
