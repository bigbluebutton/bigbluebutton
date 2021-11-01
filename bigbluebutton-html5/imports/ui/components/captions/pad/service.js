import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
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

const getPadId = (locale) => makeCall('getPadId', locale);

const buildPadURL = (padId) => {
  if (padId) {
    const params = getPadParams();
    const url = Auth.authenticateURL(`${NOTE_CONFIG.url}/p/${padId}?${params}`);
    return url;
  }

  return null;;
};

export default {
  getPadId,
  buildPadURL,
};
