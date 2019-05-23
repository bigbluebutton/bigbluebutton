import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';

const getUserRoles = () => {
  const user = Users.findOne({
    userId: Auth.userID,
  });

  return user.role;
};

const updateSettings = (obj) => {
  Object.keys(obj).forEach(k => (Settings[k] = obj[k]));
  Settings.save();
};

const getAvailableLocales = () => fetch('/html5client/locales').then(locales => locales.json());

export {
  getUserRoles,
  updateSettings,
  getAvailableLocales,
};
