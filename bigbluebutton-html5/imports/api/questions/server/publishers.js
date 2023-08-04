import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Questions from '/imports/api/questions';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function questions() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Questions was requested by unauth connection ${this.connection.id}`);
    return Questions.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  check(meetingId, String);
  check(userId, String);

  Logger.debug(`Publishing questions for ${meetingId} ${userId}`);

  return Questions.find({ meetingId });
}

function publish(...args) {
  const boundQuestions = questions.bind(this);
  return boundQuestions(...args);
}

Meteor.publish('questions', publish);
