import { Meteor } from 'meteor/meteor';
import { hashFNV32a } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;
const BASENAME = Meteor.settings.public.app.basename;
const APP = Meteor.settings.private.app;
const LOCALES_URL = `http://${APP.host}:${APP.port}${BASENAME}${APP.localesUrl}`;
const CAPTIONS = '_captions_';
const TOKEN = '$';

// Captions padId should look like: {padId}_captions_{locale}
const generatePadId = (meetingId, locale) => {
  const padId = `${hashFNV32a(meetingId, true)}${CAPTIONS}${locale}`;
  return padId;
};

const isCaptionsPad = (padId) => {
  const splitPadId = padId.split(CAPTIONS);
  return splitPadId.length === 2;
};

const getDataFromChangeset = (changeset) => {
  const splitChangeset = changeset.split(TOKEN);
  if (splitChangeset.length > 1) {
    splitChangeset.shift();
    return splitChangeset.join(TOKEN);
  }
  return '';
};

const isEnabled = () => CAPTIONS_CONFIG.enabled;

const getLocalesURL = () => LOCALES_URL;

const processForCaptionsPadOnly = fn => (message, ...args) => {
  const { body } = message;
  const { pad } = body;
  const { id } = pad;

  check(id, String);

  if (isCaptionsPad(id)) return fn(message, ...args);
  return () => {};
};

export {
  generatePadId,
  processForCaptionsPadOnly,
  isEnabled,
  getLocalesURL,
  getDataFromChangeset,
};
