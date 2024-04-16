import Captions from '/imports/api/captions';
import Auth from '/imports/ui/services/auth';
import PadsService from '/imports/ui/components/pads/service';
import { makeCall } from '/imports/ui/services/api';
import { Session } from 'meteor/session';
import { isCaptionsEnabled } from '/imports/ui/services/features';

const CAPTIONS_CONFIG = window.meetingClientSettings.public.captions;
const LINE_BREAK = '\n';

const updateCaptionsOwner = (locale, name) => makeCall('updateCaptionsOwner', locale, name);

const startDictation = (locale) => makeCall('startDictation', locale);

const stopDictation = (locale) => makeCall('stopDictation', locale);

const getCaptionsSettings = () => {
  const settings = Session.get('captionsSettings');
  if (settings) return settings;

  const {
    background,
    font,
  } = CAPTIONS_CONFIG;

  return {
    backgroundColor: background,
    fontColor: font.color,
    fontFamily: font.family,
    fontSize: font.size,
  };
};

const setCaptionsSettings = (settings) => Session.set('captionsSettings', settings);

const getCaptionsLocale = () => Session.get('captionsLocale') || '';

const setCaptionsLocale = (locale) => Session.set('captionsLocale', locale);

const getCaptionsActive = () => Session.get('captionsActive') || '';

const formatCaptionsText = (text) => {
  const splitText = text.split(LINE_BREAK);
  const filteredText = splitText.filter((line, index) => {
    const lastLine = index === (splitText.length - 1);
    const emptyLine = line.length === 0;

    return (!emptyLine || lastLine);
  });

  while (filteredText.length > CAPTIONS_CONFIG.lines) filteredText.shift();

  return filteredText.join(LINE_BREAK);
};

const setCaptionsActive = (locale) => Session.set('captionsActive', locale);

const amICaptionsOwner = (ownerId) => ownerId === Auth.userID;

const isCaptionsActive = () => {
  const enabled = isCaptionsEnabled();
  const activated = getCaptionsActive() !== '';

  return (enabled && activated);
};

const deactivateCaptions = () => setCaptionsActive('');

const activateCaptions = (locale, settings) => {
  setCaptionsSettings(settings);
  setCaptionsActive(locale);
};

const createCaptions = (locale, name) => {
  PadsService.createGroup(locale, CAPTIONS_CONFIG.id, name);
  updateCaptionsOwner(locale, name);
  setCaptionsLocale(locale);
};

const getDictationStatus = (isModerator) => {
  if (!CAPTIONS_CONFIG.dictation || !isModerator) {
    return {
      locale: '',
      dictating: false,
    };
  }

  const captions = Captions.findOne({
    meetingId: Auth.meetingID,
    ownerId: Auth.userID,
  }, {
    fields: {
      locale: 1,
      dictating: 1,
    },
  });

  if (captions) {
    return {
      locale: captions.locale,
      dictating: captions.dictating,
    };
  }

  return {
    locale: '',
    dictating: false,
  };
};

const canIDictateThisPad = (ownerId) => {
  if (!CAPTIONS_CONFIG.dictation) return false;

  if (ownerId !== Auth.userID) return false;

  if (!(typeof SpeechRecognitionAPI !== 'undefined')) return false;

  return true;
};

export default {
  ID: CAPTIONS_CONFIG.id,
  updateCaptionsOwner,
  startDictation,
  stopDictation,
  getCaptionsSettings,  
  amICaptionsOwner,
  isCaptionsEnabled,
  isCaptionsActive,
  deactivateCaptions,
  activateCaptions,
  formatCaptionsText,
  createCaptions,
  getCaptionsLocale,
  setCaptionsLocale,
  getDictationStatus,
  canIDictateThisPad,
};
