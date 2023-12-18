import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';
import {notify} from '/imports/ui/services/notification';
import GuestService from '/imports/ui/components/waiting-users/service';
import Intl from '/imports/ui/services/locale';

const getUserRoles = () => {
  const user = Users.findOne({
    userId: Auth.userID,
  });

  return user.role;
};

const isPresenter = () => {
  const user = Users.findOne({
    userId: Auth.userID,
  });

  return user.presenter;
};

const showGuestNotification = () => {
  const guestPolicy = GuestService.getGuestPolicy();

  // Guest notification only makes sense when guest
  // entrance is being controlled by moderators
  return guestPolicy === 'ASK_MODERATOR';
};

const isKeepPushingLayoutEnabled = () => Meteor.settings.public.layout.showPushLayoutToggle;

const updateSettings = (obj, msgDescriptor) => {
  Object.keys(obj).forEach(k => (Settings[k] = obj[k]));
  Settings.save();

  if (msgDescriptor) {
    // prevents React state update on unmounted component
    setTimeout(() => {
      Intl.formatMessage(msgDescriptor).then((txt) => {
        notify(
          txt,
          'info',
          'settings',
        );
      });
    }, 0);
  }
};

const getAvailableLocales = () => fetch('./locale-list').then(locales => locales.json());

export {
  getUserRoles,
  isPresenter,
  showGuestNotification,
  updateSettings,
  isKeepPushingLayoutEnabled,
  getAvailableLocales,
};
