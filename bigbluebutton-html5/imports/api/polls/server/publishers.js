import { Meteor } from 'meteor/meteor';
import Polls from '/imports/api/polls';
import { check } from 'meteor/check';
import { logger } from '/imports/startup/server/logger';
import mapToAcl from '/imports/startup/mapToAcl';

Meteor.publish('polls', function () {
  const boundPolls = polls.bind(this);
  return mapToAcl('subscriptions.polls', boundPolls)(arguments);
});

function polls(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const selector = {
    meetingId: meetingId,
    users: requesterUserId,
  };

  let options = {};

  return Polls.find(selector, options);
};
