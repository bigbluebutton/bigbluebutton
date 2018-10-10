import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Polls from '/imports/api/polls';
import mapToAcl from '/imports/startup/mapToAcl';

Meteor.publish('results', (meetingId) => {
  check(meetingId, String);

  const selector = {
    meetingId,
  };

  Logger.info(`Publishing poll results for meeting=${meetingId}`);

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
  return mapToAcl('subscriptions.polls', boundPolls)(args);
}

Meteor.publish('polls', publish);

