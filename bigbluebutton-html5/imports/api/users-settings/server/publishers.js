import { Meteor } from 'meteor/meteor';
import UserSettings from '/imports/api/users-settings';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function userSettings() {
  if (!this.userId) {
    return UserSettings.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug(`Publishing user settings for user=${requesterUserId}`);

  return UserSettings.find({ meetingId, userId: requesterUserId });
}

function publish(...args) {
  const boundUserSettings = userSettings.bind(this);
  return boundUserSettings(...args);
}

Meteor.publish('users-settings', publish);
