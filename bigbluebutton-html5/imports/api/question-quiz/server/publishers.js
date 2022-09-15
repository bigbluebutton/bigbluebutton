import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import QuestionQuizs from '/imports/api/question-quiz';
import AuthTokenValidation, {
  ValidationStates,
} from '/imports/api/auth-token-validation';
import { DDPServer } from 'meteor/ddp-server';

Meteor.server.setPublicationStrategy('questionQuizs', DDPServer.publicationStrategies.NO_MERGE);

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function currentQuestionQuiz(secretQuestionQuiz) {
  check(secretQuestionQuiz, Boolean);
  const tokenValidation = AuthTokenValidation.findOne({
    connectionId: this.connection.id,
  });
  if (
    !tokenValidation
    || tokenValidation.validationStatus !== ValidationStates.VALIDATED
  ) {
    Logger.warn(
      `Publishing QuestionQuizs was requested by unauth connection ${this.connection.id}`,
    );
    return QuestionQuizs.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  const User = Users.findOne({ userId, meetingId }, { fields: { role: 1, presenter: 1 } });

  if (!!User && User.presenter) {
    Logger.debug('Publishing QuestionQuizs', { meetingId, userId });

    const selector = {
      meetingId,
      requester: userId,
      isPublished: false
    };

    const options = { fields: {} };

    const hasQuestionQuiz = QuestionQuizs.findOne(selector);

    if ((hasQuestionQuiz && hasQuestionQuiz.secretQuestionQuiz) || secretQuestionQuiz) {
      options.fields.responses = 0;
      selector.secretQuestionQuiz = true;
    } else {
      selector.secretQuestionQuiz = false;
    }
    Mongo.Collection._publishCursor(QuestionQuizs.find(selector, options), this, 'current-questionQuiz');
    return this.ready();
  }

  Logger.warn(
    'Publishing current-questionQuiz was requested by non-presenter connection',
    { meetingId, userId, connectionId: this.connection.id },
  );
  Mongo.Collection._publishCursor(QuestionQuizs.find({ meetingId: '' }), this, 'current-questionQuiz');
  return this.ready();
}

function publishCurrentQuestionQuiz(...args) {
  const boundQuestionQuizs = currentQuestionQuiz.bind(this);
  return boundQuestionQuizs(...args);
}

Meteor.publish('current-questionQuiz', publishCurrentQuestionQuiz);

function questionQuizs() {
  const tokenValidation = AuthTokenValidation.findOne({
    connectionId: this.connection.id,
  });

  if (
    !tokenValidation
    || tokenValidation.validationStatus !== ValidationStates.VALIDATED
  ) {
    Logger.warn(
      `Publishing QuestionQuizs was requested by unauth connection ${this.connection.id}`,
    );
    return QuestionQuizs.find({ meetingId: '' });
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

  Logger.debug('Publishing questionQuizs', { meetingId, userId });

  const selector = {
    meetingId,
    users: userId,
  };

  if (User) {
    const questionQuiz = QuestionQuizs.findOne(selector, noKeyOptions);

    if (User.role === ROLE_MODERATOR || questionQuiz?.questionQuizType !== 'R-') {
      return QuestionQuizs.find(selector, options);
    }
  }

  return QuestionQuizs.find(selector, noKeyOptions);
}

function publish(...args) {
  const boundQuestionQuizs = questionQuizs.bind(this);
  return boundQuestionQuizs(...args);
}

Meteor.publish('questionQuizs', publish);
