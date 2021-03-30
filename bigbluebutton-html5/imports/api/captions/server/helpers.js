import { Meteor } from 'meteor/meteor';
import { hashSHA1 } from '/imports/api/common/server/etherpad';
import { check } from 'meteor/check';

const ETHERPAD = Meteor.settings.private.etherpad;
const CAPTIONS_CONFIG = Meteor.settings.public.captions;
const BASENAME = Meteor.settings.public.app.basename;
const APP = Meteor.settings.private.app;
const LOCALES_URL = `http://${APP.host}:${APP.port}${BASENAME}${APP.localesUrl}`;
const CAPTIONS_TOKEN = '_cc_';
const TOKEN = '$';

// Captions padId should look like: {prefix}_cc_{locale}
const generatePadId = (meetingId, locale) => `${hashSHA1(meetingId+locale+ETHERPAD.apikey)}${CAPTIONS_TOKEN}${locale}`;

const isCaptionsPad = (padId) => {
  const splitPadId = padId.split(CAPTIONS_TOKEN);
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
  CAPTIONS_TOKEN,
  generatePadId,
  processForCaptionsPadOnly,
  isEnabled,
  getLocalesURL,
  getDataFromChangeset,
};
