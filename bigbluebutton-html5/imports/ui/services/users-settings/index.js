import Auth from '/imports/ui/services/auth';
import UserSettings from '/imports/api/users-settings';

export const getFromSpecificUserSettings = (userID, setting, defaultValue) => {
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

export const isGhostUser = user => getFromSpecificUserSettings(user.userId, 'bbb_ghost_user', false);

// eslint-disable-next-line max-len
const getFromUserSettings = (setting, defaultValue) => getFromSpecificUserSettings(Auth.userID, setting, defaultValue);

// eslint-disable-next-line max-len
export default getFromUserSettings;
