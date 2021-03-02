import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';

const NOTE_CONFIG = Meteor.settings.public.note;

const getLang = () => {
  const { locale } = Settings.application;
  return locale ? locale.toLowerCase() : '';
};

const getPadParams = () => {
  let config = {};
  config.lang = getLang();
  config.rtl = document.documentElement.getAttribute('dir') === 'rtl';

  const params = [];
  Object.keys(config).forEach((k) => {
    params.push(`${k}=${encodeURIComponent(config[k])}`);
  });

  return params.join('&');
};

const getPadURL = (padId, readOnlyPadId, ownerId) => {
  const userId = Auth.userID;
  const params = getPadParams();
  let url;
  if (!ownerId || (ownerId && userId === ownerId)) {
    url = Auth.authenticateURL(`${NOTE_CONFIG.url}/p/${padId}?${params}`);
  } else {
    url = Auth.authenticateURL(`${NOTE_CONFIG.url}/p/${readOnlyPadId}?${params}`);
  }
  return url;
};

export default {
  getPadURL,
};
