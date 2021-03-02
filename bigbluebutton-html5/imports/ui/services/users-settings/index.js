import Auth from '/imports/ui/services/auth';
import UserSettings from '/imports/api/users-settings';

export default function getFromUserSettings(setting, defaultValue) {
  const selector = {
    meetingId: Auth.meetingID,
    userId: Auth.userID,
    setting,
  };

  const userSetting = UserSettings.findOne(selector);

  if (userSetting !== undefined) {
    return userSetting.value;
  }

  return defaultValue;
}
