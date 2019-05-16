import { Meteor } from 'meteor/meteor';
import { hashFNV32a } from '/imports/api/common/server/helpers';

const ETHERPAD = Meteor.settings.private.etherpad;
const NOTE_CONFIG = Meteor.settings.public.note;
const BASE_URL = `http://${ETHERPAD.host}:${ETHERPAD.port}/api/${ETHERPAD.version}`;

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

const getDataFromResponse = (data, key) => {
  if (data) {
    const innerData = data.data;
    if (innerData && innerData[key]) {
      return innerData[key];
    }
  }
  return null;
};

export {
  generateNoteId,
  createPadURL,
  getReadOnlyIdURL,
  isEnabled,
  getDataFromResponse,
};
