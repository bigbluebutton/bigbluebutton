import { Meteor } from 'meteor/meteor';
import { hashSHA1 } from '/imports/api/common/server/etherpad';

const ETHERPAD = Meteor.settings.private.etherpad;
const NOTE_CONFIG = Meteor.settings.public.note;
const TOKEN = '_';

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

const generatePadId = (meetingId) => hashSHA1(meetingId+ETHERPAD.apikey);

export {
  generatePadId,
  isEnabled,
  getDataFromResponse,
  processForNotePadOnly,
};
