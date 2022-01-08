import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';
import { notify } from '/imports/ui/services/notification';
import GuestService from '/imports/ui/components/waiting-users/service';
import WhiteboardService from '/imports/ui/components/whiteboard/service';

const getUserRoles = () => {
  const user = Users.findOne({
    userId: Auth.userID,
  });

  return user.role;
};

const showGuestNotification = () => {
  const guestPolicy = GuestService.getGuestPolicy();

  // Guest notification only makes sense when guest
  // entrance is being controlled by moderators
  return guestPolicy === 'ASK_MODERATOR';
};

const updateSettings = (obj, msg) => {
  // Update whiteboard mode
  const dataSaveSetting = obj['dataSaving'];
  const newWhiteboardMode = {
    synchronizeWBUpdate: dataSaveSetting.synchronizeWBUpdate,
    simplifyPencil: dataSaveSetting.simplifyPencil,
  };
  WhiteboardService.setWhiteboardMode(newWhiteboardMode);
  
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

const getAvailableLocales = () => fetch('./locale-list').then(locales => locales.json());

export {
  getUserRoles,
  showGuestNotification,
  updateSettings,
  getAvailableLocales,
};
