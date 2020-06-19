import Auth from '/imports/ui/services/auth';
import UserSettings from '/imports/api/users-settings';

let getFromSpecificUserSettings = function(userID, setting, defaultValue) {
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

module.exports.getFromSpecificUserSettings = getFromSpecificUserSettings;

module.exports.getFromUserSettings = function(setting, defaultValue) {
  return getFromSpecificUserSettings(Auth.userID, setting, defaultValue);
};
