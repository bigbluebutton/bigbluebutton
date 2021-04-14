import Screenshare from '/imports/api/screenshare';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function screenshare() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Screenshare was requested by unauth connection ${this.connection.id}`);
    return Screenshare.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing Screenshare', { meetingId, userId });

  return Screenshare.find({ meetingId });
}

function publish(...args) {
  const boundScreenshare = screenshare.bind(this);
  return boundScreenshare(...args);
}

Meteor.publish('screenshare', publish);
