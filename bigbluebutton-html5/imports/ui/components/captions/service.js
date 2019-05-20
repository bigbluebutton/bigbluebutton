import _ from 'lodash';
import Captions from '/imports/api/captions';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;
const CAPTIONS = '_captions_';

const getCaptionsData = () => {
  const activeCaptions = getActiveCaptions();
  let padId = "";
  let revs = 0;
  let data = "";
  if (activeCaptions) {
    const captions = getCaptions(activeCaptions);
    if (!_.isEmpty(captions)) {
      padId = captions.padId;
      revs = captions.revs;
      data = captions.data;
    }
  }

  return { padId, revs, data };
};

const getAvailableLocales = () => {
  const { meetingID } = Auth;
  let locales = [];
  Captions.find({ meetingId: meetingID }).map(caption => {
    if (caption.ownerId === "") {
      locales.push(caption.locale);
    }
  });
  return locales;
};

const getOwnedLocales = () => {
  const { meetingID } = Auth;
  let locales = [];
  Captions.find({ meetingId: meetingID }).map(caption => {
    if (caption.ownerId !== "") {
      locales.push(caption.locale);
    }
  });
  return locales;
};

const getCaptions = locale => {
  const captions = Captions.findOne({ meetingId: Auth.meetingID, padId: { $regex: `${CAPTIONS}${locale}$` }});
  return captions;
};

const takeOwnership = locale => {
  makeCall('takeOwnership', locale);
};

const canIOwnThisPad = ownerId => {
  const { userID } = Auth;
  if (!CAPTIONS_CONFIG.takeOwnership) return false;
  if (ownerId === "") return false;
  return ownerId !== userID;
};

const getActiveCaptions = () => {
  const activeCaptions = Session.get('activeCaptions');
  if (!activeCaptions) return '';
  return activeCaptions;
};

const setActiveCaptions = (locale) => {
  Session.set('activeCaptions', locale);
};

const setCaptionsSettings = (settings) => {
  Session.set('captionsSettings', settings);
};

const getCaptionsSettings = () => {
  const settings = Session.get('captionsSettings');
  if (!settings) {
    const { backgroundColor, fontColor, fontFamily, fontSize } = CAPTIONS_CONFIG;
    return { backgroundColor, fontColor, fontFamily, fontSize };
  }
  return settings;
}

const isCaptionsEnabled = () => {
  return CAPTIONS_CONFIG.enabled;
}

const isCaptionsAvailable = () => {
  if (isCaptionsEnabled) {
    const ownedLocales = getOwnedLocales();
    return (ownedLocales.length > 0);
  }
  return false;
}

const isCaptionsActive = () => {
  const enabled = isCaptionsEnabled();
  const activated = getActiveCaptions() !== '';
  return (enabled && activated);
}

const deactivateCaptions = () => {
  setActiveCaptions('');
}

const activateCaptions = (locale, settings) => {
  setCaptionsSettings(settings);
  setActiveCaptions(locale);
}

export default {
  getCaptionsData,
  getAvailableLocales,
  getOwnedLocales,
  takeOwnership,
  getCaptions,
  canIOwnThisPad,
  getCaptionsSettings,
  isCaptionsEnabled,
  isCaptionsAvailable,
  isCaptionsActive,
  deactivateCaptions,
  activateCaptions,
};
