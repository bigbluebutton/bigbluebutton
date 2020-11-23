import { Meteor } from 'meteor/meteor';
import LocalSettings from '/imports/api/local-settings';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function localSettings() {
  if (!this.userId) {
    return LocalSettings.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug('Publishing local settings', { requesterUserId });

  return LocalSettings.find({ meetingId, userId: requesterUserId });
}

function publish(...args) {
  const boundLocalSettings = localSettings.bind(this);
  return boundLocalSettings(...args);
}

Meteor.publish('local-settings', publish);
