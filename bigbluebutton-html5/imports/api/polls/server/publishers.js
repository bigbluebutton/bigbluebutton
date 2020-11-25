import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import Polls from '/imports/api/polls';
import { extractCredentials } from '/imports/api/common/server/helpers';

function currentPoll() {
  if (!this.userId) {
    return Polls.find({ meetingId: '' });
  }
  const { meetingId } = extractCredentials(this.userId);

  const selector = {
    meetingId,
  };

  Logger.debug('Publishing poll', { meetingId });

  return Polls.find(selector);
}

function publishCurrentPoll(...args) {
  const boundPolls = currentPoll.bind(this);
  return boundPolls(...args);
}

Meteor.publish('current-poll', publishCurrentPoll);


function polls() {
  if (!this.userId) {
    return Polls.find({ meetingId: '' });
  }

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug('Publishing polls', { meetingId, requesterUserId });

  const selector = {
    meetingId,
    users: requesterUserId,
  };

  return Polls.find(selector);
}

function publish(...args) {
  const boundPolls = polls.bind(this);
  return boundPolls(...args);
}

Meteor.publish('polls', publish);
