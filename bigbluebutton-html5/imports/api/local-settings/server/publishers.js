import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import LocalSettings from '/imports/api/local-settings';
import Logger from '/imports/startup/server/logger';

function localSettings(credentials) {
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  Logger.debug(`Publishing local settings for user=${requesterUserId}`);

  return LocalSettings.find({ meetingId, userId: requesterUserId });
}

function publish(...args) {
  const boundLocalSettings = localSettings.bind(this);
  return boundLocalSettings(...args);
}

Meteor.publish('local-settings', publish);
