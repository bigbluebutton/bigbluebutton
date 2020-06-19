import Auth from '/imports/ui/services/auth';
import UserSettings from '/imports/api/users-settings';

export default function getFromSpecificUserSettings(userID, setting, defaultValue) {
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
}

export default function getFromUserSettings(setting, defaultValue) {
  return getFromSpecificUserSettings(Auth.userID, setting, defaultValue);
}
