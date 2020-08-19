import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import ConnectionStatus from '/imports/api/connection-status';
import { extractCredentials } from '/imports/api/common/server/helpers';

function connectionStatus() {
  if (!this.userId) {
    return ConnectionStatus.find({ meetingId: '' });
  }

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);

  Logger.info(`Publishing connection status for ${meetingId} ${requesterUserId}`);

  return ConnectionStatus.find({ meetingId });
}

function publish(...args) {
  const boundNote = connectionStatus.bind(this);
  return boundNote(...args);
}

Meteor.publish('connection-status', publish);
