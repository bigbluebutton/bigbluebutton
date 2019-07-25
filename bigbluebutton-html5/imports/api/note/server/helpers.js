import { Meteor } from 'meteor/meteor';
import { hashFNV32a } from '/imports/api/common/server/helpers';

const ETHERPAD = Meteor.settings.private.etherpad;
const NOTE_CONFIG = Meteor.settings.public.note;
const BASE_URL = `http://${ETHERPAD.host}:${ETHERPAD.port}/api/${ETHERPAD.version}`;
const TOKEN = '_';

const createPadURL = padId => `${BASE_URL}/createPad?apikey=${ETHERPAD.apikey}&padID=${padId}`;

const getReadOnlyIdURL = padId => `${BASE_URL}/getReadOnlyID?apikey=${ETHERPAD.apikey}&padID=${padId}`;

const appendTextURL = (padId, text) => `${BASE_URL}/appendText?apikey=${ETHERPAD.apikey}&padID=${padId}&text=${encodeURIComponent(text)}`;

const generateNoteId = (meetingId) => {
  const noteId = hashFNV32a(meetingId, true);
  return noteId;
};

const isEnabled = () => NOTE_CONFIG.enabled;

const getDataFromResponse = (data, key) => {
  if (data) {
    const innerData = data.data;
    if (innerData && innerData[key]) {
      return innerData[key];
    }
  }
  return null;
};

const isNotePad = padId => padId.search(TOKEN);

const processForNotePadOnly = fn => (message, ...args) => {
  const { body } = message;
  const { pad } = body;
  const { id } = pad;

  check(id, String);

  if (isNotePad(id)) return fn(message, ...args);
  return () => {};
};

export {
  generateNoteId,
  createPadURL,
  getReadOnlyIdURL,
  isEnabled,
  getDataFromResponse,
  appendTextURL,
  processForNotePadOnly,
};
