import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import addUserSetting from '/imports/api/users-settings/server/modifiers/addUserSetting';

export default function addUserSettings(credentials, meetingId, userId, setting, value) {
  check(meetingId, String);
  check(userId, String);
  check(setting, String);
  check(value, Match.Any);

  return addUserSetting(meetingId, userId, setting, value);
}
