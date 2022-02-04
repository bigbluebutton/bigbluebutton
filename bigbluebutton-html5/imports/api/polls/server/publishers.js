import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import Polls from '/imports/api/polls';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
function currentPoll() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Polls was requested by unauth connection ${this.connection.id}`);
    return Polls.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  const User = Users.findOne({ userId, meetingId }, { fields: { role: 1, presenter: 1 } });

  if (!!User && (User.role === ROLE_MODERATOR || User.presenter)) {
    Logger.debug('Publishing Polls', { meetingId, userId });

    const selector = {
      meetingId,
    };

    return Polls.find(selector);
  }

  Logger.warn(
    'Publishing current-poll was requested by non-moderator connection',
    { meetingId, userId, connectionId: this.connection.id },
  );
  return Polls.find({ meetingId: '' });
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

  const options = {
    fields: {
      'answers.numVotes': 0,
      responses: 0,
    },
  };

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing polls', { meetingId, userId });

  const selector = {
    meetingId,
    users: userId,
  };

  return Polls.find(selector, options);
}

function publish(...args) {
  const boundPolls = polls.bind(this);
  return boundPolls(...args);
}

Meteor.publish('polls', publish);
