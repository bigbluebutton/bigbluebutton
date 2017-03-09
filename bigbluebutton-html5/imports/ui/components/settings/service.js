import Storage from '/imports/ui/services/storage/session';
import Users from '/imports/api/users';
import Captions from '/imports/api/captions';
import Auth from '/imports/ui/services/auth';
import _ from 'underscore';

const updateSettings = (obj) => {
  Object.keys(obj).forEach(k => Storage.setItem(`settings_${k}`, obj[k]));
};

const getSettingsFor = (key) => {
  const setting = Storage.getItem(`settings_${key}`);

  return setting;
};

const getClosedCaptionLocales = () => {
  //list of unique locales in the Captions Collection
  const locales = _.uniq(Captions.find({}, {
    sort: { locale: 1 },
    fields: { locale: true },
  }).fetch().map(function (obj) {
    return obj.locale;
  }), true);

  return locales;
};

const getUserRoles = () => {
  const user = Users.findOne({
    userId: Auth.userID,
  }).user;

  return user.role;
};

const setDefaultSettings = () => {
  const defaultSettings = {
    application: {
      chatAudioNotifications: false,
      chatPushNotifications: false,
      fontSize: '14px',
    },
    audio: {
      inputDeviceId: undefined,
      outputDeviceId: undefined,
    },
    video: {
      viewParticipantsWebcams: true,
    },
    cc: {
      backgroundColor: '#FFFFFF',
      fontColor: '#000000',
      closedCaptions: false,
      fontFamily: 'Calibri',
      fontSize: -1,
      locale: -1,
      takeOwnership: false,
    },
    participants: {
      muteAll: false,
      lockAll: false,
      lockAll: false,
      microphone: false,
      publicChat: false,
      privateChat: false,
      layout: false,
    },
  };

  const savedSettings = {
    application: getSettingsFor('application'),
    audio: getSettingsFor('audio'),
    video: getSettingsFor('video'),
    cc: getSettingsFor('cc'),
    participants: getSettingsFor('participants'),
  };

  let settings = {};

  Object.keys(defaultSettings).forEach(key => {
    settings[key] = _.extend(defaultSettings[key], savedSettings[key]);
  });

  updateSettings(settings);
};

export {
  updateSettings,
  getSettingsFor,
  getClosedCaptionLocales,
  getUserRoles,
  setDefaultSettings,
};
