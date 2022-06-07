import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import ConnectionStatus from '/imports/api/connection-status';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function connectionStatus() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing ConnectionStatus was requested by unauth connection ${this.connection.id}`);
    return ConnectionStatus.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  check(meetingId, String);
  check(userId, String);

  Logger.info(`Publishing connection status for ${meetingId} ${userId}`);

  return ConnectionStatus.find({ meetingId });
}

function publish(...args) {
  const boundNote = connectionStatus.bind(this);
  return boundNote(...args);
}

Meteor.publish('connection-status', publish);
