import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import UserSettings from '/imports/api/users-settings';
import Logger from '/imports/startup/server/logger';
import mapToAcl from '/imports/startup/mapToAcl';

function userSettings(credentials) {
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  Logger.info(`Publishing user settings for user=${requesterUserId}`);

  return UserSettings.find({ meetingId, userId: requesterUserId });
}

function publish(...args) {
  const boundUserSettings = userSettings.bind(this);
  return mapToAcl('subscriptions.users-settings', boundUserSettings)(args);
}

Meteor.publish('users-settings', publish);
