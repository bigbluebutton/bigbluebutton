import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import Polls from '/imports/api/polls';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function currentPoll() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Polls was requested by unauth connection ${this.connection.id}`);
    return Polls.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing Polls', { meetingId, userId });

  const selector = {
    meetingId,
  };

  return Polls.find(selector);
}

function publishCurrentPoll(...args) {
  const boundPolls = currentPoll.bind(this);
  return boundPolls(...args);
}

Meteor.publish('current-poll', publishCurrentPoll);


function polls() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Polls was requested by unauth connection ${this.connection.id}`);
    return Polls.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing polls', { meetingId, userId });

  const selector = {
    meetingId,
    users: userId,
  };

  return Polls.find(selector);
}

function publish(...args) {
  const boundPolls = polls.bind(this);
  return boundPolls(...args);
}

Meteor.publish('polls', publish);
