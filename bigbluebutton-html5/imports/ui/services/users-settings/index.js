import Auth from '/imports/ui/services/auth';
import UserSettings from '/imports/api/users-settings';
import Users from '/imports/api/users';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const getFromSpecificUserSettings = (userID, setting, defaultValue) => {
  const selector = {
    meetingId: Auth.meetingID,
    userId: userID,
    setting,
  };

  const userSetting = UserSettings.findOne(selector);

  if (userSetting !== undefined && userSetting.value !== undefined) {
    return userSetting.value;
  }

  return defaultValue;
};

function appliesMagicCapSelfException(userId) {
  return getFromSpecificUserSettings(userId, 'bbb_magic_cap_user_visible_for_herself', false)
      && userId === Auth.userID;
}

function appliesMagicCapModeratorException(userId) {
  if (!getFromSpecificUserSettings(userId, 'bbb_magic_cap_user_visible_for_moderator', false)) {
    return false;
  }
  let currentUser = Users.findOne({ userId: Auth.userID });
  if (!currentUser) {
    return false;
  }
  if (currentUser.breakoutProps.isBreakoutUser) {
    currentUser = Users.findOne({ userId: currentUser.extId.split('-')[0] });
  }
  return currentUser.role === ROLE_MODERATOR;
}

// eslint-disable-next-line max-len
const getFromUserSettings = (setting, defaultValue) => getFromSpecificUserSettings(Auth.userID, setting, defaultValue);

// predicate function for determining whether user wears a magic cap
function hiddenByMagicCap(user) {
  const { userId } = user;
  return getFromSpecificUserSettings(userId, 'bbb_magic_cap_user', false)
          && !appliesMagicCapSelfException(userId)
          && !appliesMagicCapModeratorException(userId);
}

export { getFromSpecificUserSettings, getFromUserSettings, hiddenByMagicCap };

// Export getFromUserSettings as default here, additionally, though this is somewhat inconsistent.
// Otherwise, the import statements in too many files would have to be touched (in my eyes).
export default getFromUserSettings;
