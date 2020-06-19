import Auth from '/imports/ui/services/auth';
import UserSettings from '/imports/api/users-settings';

const getFromSpecificUserSettings = (userID, setting, defaultValue) => {
  const selector = {
    meetingId: Auth.meetingID,
    userId: userID,
    setting,
  };

  const userSetting = UserSettings.findOne(selector);

  if (userSetting !== undefined) {
    return userSetting.value;
  }

  return defaultValue;
};

// eslint-disable-next-line max-len
const getFromUserSettings = (setting, defaultValue) => getFromSpecificUserSettings(Auth.userID, setting, defaultValue);

// predicate function for determining whether user wears a magic cap
const isMagicCapUser = user => getFromSpecificUserSettings(user.userId, 'bbb_magic_cap_user', false);

export { getFromSpecificUserSettings, getFromUserSettings, isMagicCapUser };

// Export getFromUserSettings as default here, additionally, though this is somewhat inconsistent.
// Otherwise, the import statements in too many files would have to be touched (in my eyes).
export default getFromUserSettings;
