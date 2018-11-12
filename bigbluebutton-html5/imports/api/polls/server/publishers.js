import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Polls from '/imports/api/polls';

Meteor.publish('current-poll', (meetingId) => {
  check(meetingId, String);

  const selector = {
    meetingId,
  };

  Logger.info(`Publishing poll for meeting=${meetingId}`);

  return Polls.find(selector);
});


function polls(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.info(`Publishing polls =${meetingId} ${requesterUserId} ${requesterToken}`);

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

