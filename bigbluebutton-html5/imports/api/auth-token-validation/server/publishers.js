import { Meteor } from 'meteor/meteor';
import AuthTokenValidation from '/imports/api/auth-token-validation';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function authTokenValidation() {
  const connectionId = this.connection.id;
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  const selector = {
    meetingId,
    userId: requesterUserId,
    connectionId,
  };

  Logger.debug(`Publishing auth-token-validation for ${meetingId} ${requesterUserId}`);

  return AuthTokenValidation.find(selector);
}

function publish(...args) {
  const boundAuthTokenValidation = authTokenValidation.bind(this);
  return boundAuthTokenValidation(...args);
}

Meteor.publish('auth-token-validation', publish);
