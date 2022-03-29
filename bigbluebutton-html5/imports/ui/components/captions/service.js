import Captions from '/imports/api/captions';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import PadsService from '/imports/ui/components/pads/service';
import SpeechService from '/imports/ui/components/captions/speech/service';
import { makeCall } from '/imports/ui/services/api';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { isCaptionsEnabled } from '/imports/ui/services/features';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const LINE_BREAK = '\n';

const getAvailableLocales = () => {
  const availableLocales = Captions.find(
    { meetingId: Auth.meetingID, ownerId: '' },
    { sort: { locale: 1 } },
    { fields: { ownerId: 1, locale: 1, name: 1 } },
  ).fetch();

  return availableLocales;
};

const getOwnedLocales = () => {
  const ownedLocales = Captions.find(
    { meetingId: Auth.meetingID, ownerId: { $not: '' } },
    { fields: { ownerId: 1, locale: 1, name: 1 } },
  ).fetch();

  return ownedLocales;
};

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

const getCaptions = () => {
  const locale = getCaptionsLocale();
  if (locale) {
    const {
      name,
      ownerId,
      dictating,
    } = Captions.findOne({
      meetingId: Auth.meetingID,
      locale,
    });

    return {
      locale,
      name,
      ownerId,
      dictating,
    };
  }

  return {
    locale,
    name: '',
    ownerId: '',
    dictating: false,
  };
};

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

const getCaptionsData = () => {
  const locale = getCaptionsActive();
  if (locale) {
    const captions = Captions.findOne({
      meetingId: Auth.meetingID,
      locale,
      dictating: true,
    });

    let data = '';
    if (captions) {
      data = captions.transcript;
    } else {
      data = PadsService.getPadTail(locale);
    }

    return formatCaptionsText(data);
  }

  return '';
};

const setCaptionsActive = (locale) => Session.set('captionsActive', locale);

const amICaptionsOwner = (ownerId) => ownerId === Auth.userID;

const isCaptionsAvailable = () => {
  if (isCaptionsEnabled()) {
    const ownedLocales = getOwnedLocales();

    return (ownedLocales.length > 0);
  }

  return false;
};

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

const amIModerator = () => {
  const user = Users.findOne(
    { userId: Auth.userID },
    { fields: { role: 1 } },
  );

  return user && user.role === ROLE_MODERATOR;
};

const getName = (locale) => {
  const captions = Captions.findOne({
    meetingId: Auth.meetingID,
    locale,
  });

  return captions.name;
};

const createCaptions = (locale) => {
  const name = getName(locale);
  PadsService.createGroup(locale, CAPTIONS_CONFIG.id, name);
  updateCaptionsOwner(locale, name);
  setCaptionsLocale(locale);
};

const hasPermission = () => {
  if (amIModerator()) {
    const { ownerId } = getCaptions();

    return Auth.userID === ownerId;
  }

  return false;
};

const getDictationStatus = () => {
  if (!CAPTIONS_CONFIG.dictation || !amIModerator()) {
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

  if (!SpeechService.hasSpeechRecognitionSupport()) return false;

  return true;
};

export default {
  ID: CAPTIONS_CONFIG.id,
  getAvailableLocales,
  getOwnedLocales,
  updateCaptionsOwner,
  startDictation,
  stopDictation,
  getCaptionsSettings,
  getCaptionsData,
  getCaptions,
  hasPermission,
  amICaptionsOwner,
  isCaptionsEnabled,
  isCaptionsAvailable,
  isCaptionsActive,
  deactivateCaptions,
  activateCaptions,
  formatCaptionsText,
  amIModerator,
  createCaptions,
  getCaptionsLocale,
  setCaptionsLocale,
  getDictationStatus,
  canIDictateThisPad,
};
