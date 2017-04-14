import Users from '/imports/api/users';
import Captions from '/imports/api/captions';
import Auth from '/imports/ui/services/auth';
import _ from 'lodash';
import Settings from '/imports/ui/services/settings';

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

const updateSettings = (obj) => {
  Object.keys(obj).forEach(k => Settings[k] = obj[k]);
  Settings.save();
};

export {
  getClosedCaptionLocales,
  getUserRoles,
  updateSettings,
};
