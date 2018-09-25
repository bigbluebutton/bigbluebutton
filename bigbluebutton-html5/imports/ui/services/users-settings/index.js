import Auth from '/imports/ui/services/auth';
import UserSettings from '/imports/api/users-settings';

export default function getFromUserSettings(setting, defaultValue) {
  const { meetingID: meetingId, userID: userId } = Auth;

  const selector = {
    meetingId,
    userId,
    setting,
  };

  const userSetting = UserSettings.findOne(selector);

  if (userSetting !== undefined) {
    return userSetting.value;
  }

  return defaultValue;
}
