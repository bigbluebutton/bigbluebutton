import Captions from '/imports/api/captions';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function captions() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Captions was requested by unauth connection ${this.connection.id}`);
    return Captions.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;
  Logger.debug('Publishing Captions', { meetingId, requestedBy: userId });

  return Captions.find({ meetingId });
}

function publish(...args) {
  const boundCaptions = captions.bind(this);
  return boundCaptions(...args);
}

Meteor.publish('captions', publish);
