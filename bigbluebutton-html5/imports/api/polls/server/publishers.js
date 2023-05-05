import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import Polls from '/imports/api/polls';
import AuthTokenValidation, {
  ValidationStates,
} from '/imports/api/auth-token-validation';
import { DDPServer } from 'meteor/ddp-server';
import { publicationSafeGuard } from '/imports/api/common/server/helpers';

Meteor.server.setPublicationStrategy('polls', DDPServer.publicationStrategies.NO_MERGE);

function currentPoll(secretPoll) {
  check(secretPoll, Boolean);
  const tokenValidation = AuthTokenValidation.findOne({
    connectionId: this.connection.id,
  });

  if (
    !tokenValidation
    || tokenValidation.validationStatus !== ValidationStates.VALIDATED
  ) {
    Logger.warn(
      `Publishing Polls was requested by unauth connection ${this.connection.id}`,
    );
    return Polls.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  const User = Users.findOne({ userId, meetingId }, { fields: { role: 1, presenter: 1 } });

  if (!!User && User.presenter) {
    Logger.debug('Publishing Polls', { meetingId, userId });

    const selector = {
      meetingId,
      requester: userId,
    };

    const options = { fields: {} };

    const hasPoll = Polls.findOne(selector);

    if ((hasPoll && hasPoll.secretPoll) || secretPoll) {
      options.fields.responses = 0;
      selector.secretPoll = true;
    } else {
      selector.secretPoll = false;
    }
    Mongo.Collection._publishCursor(Polls.find(selector, options), this, 'current-poll');
    return this.ready();
  }

  Logger.warn(
    'Publishing current-poll was requested by non-presenter connection',
    { meetingId, userId, connectionId: this.connection.id },
  );
  Mongo.Collection._publishCursor(Polls.find({ meetingId: '' }), this, 'current-poll');
  return this.ready();
}

function publishCurrentPoll(...args) {
  const boundPolls = currentPoll.bind(this);
  return boundPolls(...args);
}

Meteor.publish('current-poll', publishCurrentPoll);

function polls() {
  const tokenValidation = AuthTokenValidation.findOne({
    connectionId: this.connection.id,
  });

  if (
    !tokenValidation
    || tokenValidation.validationStatus !== ValidationStates.VALIDATED
  ) {
    Logger.warn(
      `Publishing Polls was requested by unauth connection ${this.connection.id}`,
    );
    return Polls.find({ meetingId: '' });
  }

  const options = {
    fields: {
      'answers.numVotes': 0,
      responses: 0,
    },
  };

  const noKeyOptions = {
    fields: {
      'answers.numVotes': 0,
      'answers.key': 0,
      responses: 0,
    },
  };

  const { meetingId, userId } = tokenValidation;
  const User = Users.findOne({ userId, meetingId }, { fields: { role: 1, presenter: 1 } });

  Logger.debug('Publishing polls', { meetingId, userId });

  const selector = {
    meetingId,
    users: userId,
  };

  if (User) {
    const poll = Polls.findOne(selector, noKeyOptions);
    if (User.presenter || poll?.pollType !== 'R-') {
      // Monitor this publication and stop it when user is not a presenter anymore or poll type has changed
      const comparisonFunc = () => {
        const user = Users.findOne({ userId, meetingId }, { fields: { role: 1, userId: 1 } });
        const currentPoll = Polls.findOne(selector, noKeyOptions);

        const condition = user.presenter || currentPoll?.pollType !== 'R-';

        if (!condition) {
          Logger.info(`conditions aren't filled anymore in publication ${this._name}: 
          user.presenter || currentPoll?.pollType !== 'R-' :${condition}, user.presenter: ${user.presenter} pollType: ${currentPoll?.pollType}`);
        }

        return condition;
      };
      publicationSafeGuard(comparisonFunc, this);
      return Polls.find(selector, options);
    }
  }

  return Polls.find(selector, noKeyOptions);
}

function publish(...args) {
  const boundPolls = polls.bind(this);
  return boundPolls(...args);
}

Meteor.publish('polls', publish);
