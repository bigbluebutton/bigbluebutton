import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import Timer from '/imports/api/timer';
import { extractCredentials } from '/imports/api/common/server/helpers';

function timer() {
  if (!this.userId) {
    return Timer.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.info(`Publishing timer for ${meetingId} ${requesterUserId}`);

  return Timer.find({ meetingId });
}

function publish(...args) {
  const boundTimer = timer.bind(this);
  return boundTimer(...args);
}

Meteor.publish('timer', publish);
