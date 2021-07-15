import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import UserReaction from '/imports/api/user-reaction';
import { extractCredentials } from '/imports/api/common/server/helpers';

function userReaction() {
  if (!this.userId) {
    return UserReaction.find({ meetingId: '' });
  }

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);

  Logger.info(`Publishing user reaction for ${meetingId} ${requesterUserId}`);

  return UserReaction.find({ meetingId });
}

function publish(...args) {
  const boundUserReaction = userReaction.bind(this);
  return boundUserReaction(...args);
}

Meteor.publish('user-reaction', publish);
