import { Meteor } from 'meteor/meteor';
import PresentationPods from '/imports/api/presentation-pods';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function presentationPods() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing PresentationPods was requested by unauth connection ${this.connection.id}`);
    return PresentationPods.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;
  Logger.debug('Publishing presentation-pods', { meetingId, userId });

  return PresentationPods.find({ meetingId });
}

function publish(...args) {
  const boundPresentationPods = presentationPods.bind(this);
  return boundPresentationPods(...args);
}

Meteor.publish('presentation-pods', publish);
