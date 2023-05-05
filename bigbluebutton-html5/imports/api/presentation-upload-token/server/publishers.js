import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function presentationUploadToken(podId, filename, temporaryPresentationId) {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing PresentationUploadToken was requested by unauth connection ${this.connection.id}`);
    return PresentationUploadToken.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  check(podId, String);
  check(filename, String);
  check(temporaryPresentationId, String);

  const selector = {
    meetingId,
    podId,
    userId,
    filename,
    temporaryPresentationId,
  };

  Logger.debug('Publishing PresentationUploadToken', { meetingId, userId });

  return PresentationUploadToken.find(selector);
}

function publish(...args) {
  const boundPresentationUploadToken = presentationUploadToken.bind(this);
  return boundPresentationUploadToken(...args);
}

Meteor.publish('presentation-upload-token', publish);
