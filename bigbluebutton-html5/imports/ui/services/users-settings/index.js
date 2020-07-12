import Auth from '/imports/ui/services/auth';
import UserSettings from '/imports/api/users-settings';

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

// eslint-disable-next-line max-len
const getFromUserSettings = (setting, defaultValue) => getFromSpecificUserSettings(Auth.userID, setting, defaultValue);

// predicate function for determining whether user wears a magic cap
function hiddenByMagicCap(user) {
  return getFromSpecificUserSettings(user.userId, 'bbb_magic_cap_user', false)
      && !((getFromSpecificUserSettings(user.userId, 'bbb_magic_cap_user_visible_for_herself', false)
            && user.userId === Auth.userID)
           || (getFromSpecificUserSettings(user.userId, 'bbb_magic_cap_user_visible_for_moderator', false)
               && user.role === ROLE_MODERATOR));
}

export { getFromSpecificUserSettings, getFromUserSettings, hiddenByMagicCap };

// Export getFromUserSettings as default here, additionally, though this is somewhat inconsistent.
// Otherwise, the import statements in too many files would have to be touched (in my eyes).
export default getFromUserSettings;
