import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';

const NOTE_CONFIG = Meteor.settings.public.note;

const getLang = () => {
  const { locale } = Settings.application;
  return locale ? locale.toLowerCase() : '';
};

const getPadParams = () => {
  const { config } = NOTE_CONFIG;
  const User = Users.findOne({ userId: Auth.userID }, { fields: { name: 1, color: 1 } });
  config.userName = User.name;
  config.userColor = User.color;
  config.lang = getLang();

  const params = [];
  Object.keys(config).forEach((k) => {
    params.push(`${k}=${encodeURIComponent(config[k])}`);
  });

  return params.join('&');
};

const getPadURL = (padId, readOnlyPadId, ownerId) => {
  const userId = Auth.userID;
  let url;
  if (!ownerId || (ownerId && userId === ownerId)) {
    const params = getPadParams();
    url = Auth.authenticateURL(`${NOTE_CONFIG.url}/p/${padId}?${params}`);
  } else {
    url = Auth.authenticateURL(`${NOTE_CONFIG.url}/p/${readOnlyPadId}`);
  }
  return url;
};

export default {
  getPadURL,
};
