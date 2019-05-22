import Users from '/imports/api/users';
import Captions from '/imports/api/captions';
import Auth from '/imports/ui/services/auth';
import _ from 'lodash';
import Settings from '/imports/ui/services/settings';
import { notify } from '/imports/ui/services/notification';

const getClosedCaptionLocales = () => {
  // list of unique locales in the Captions Collection
  const locales = _.uniq(Captions.find({}, {
    sort: { locale: 1 },
    fields: { locale: true },
  }).fetch().map(obj => obj.locale), true);

  return locales;
};

const getUserRoles = () => {
  const user = Users.findOne({
    userId: Auth.userID,
  });

  return user.role;
};

const updateSettings = (obj, msg) => {
  Object.keys(obj).forEach(k => (Settings[k] = obj[k]));
  Settings.save();

  if (msg) {
    // prevents React state update on unmounted component
    setTimeout(() => {
      notify(
        msg,
        'info',
        'settings',
      );
    }, 0);
  }
};

const getAvailableLocales = () => fetch('/html5client/locales').then(locales => locales.json());

export {
  getClosedCaptionLocales,
  getUserRoles,
  updateSettings,
  getAvailableLocales,
};
