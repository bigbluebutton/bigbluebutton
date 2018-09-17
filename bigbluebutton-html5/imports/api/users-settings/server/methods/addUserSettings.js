import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import addUserSetting from '/imports/api/users-settings/server/modifiers/addUserSetting';

export default function addUserSettings(credentials, meetingId, userId, settings) {
  check(meetingId, String);
  check(userId, String);
  check(settings, Object);

  const settingsAdded = [];

  Object.entries(settings).forEach((el) => {
    const setting = el[0];
    const value = el[1];
    settingsAdded.push(addUserSetting(meetingId, userId, setting, value));
  });

  return settingsAdded;
}
