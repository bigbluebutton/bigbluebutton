import { Meteor } from 'meteor/meteor';
import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function userInfos() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing UserInfos was requested by unauth connection ${this.connection.id}`);
    return UserInfos.find({ meetingId: '' });
  }

  const { meetingId, userId: requesterUserId } = tokenValidation;

  Logger.debug('Publishing UserInfos requested', { meetingId, requesterUserId });

  return UserInfos.find({ meetingId, requesterUserId });
}

function publish(...args) {
  const boundUserInfos = userInfos.bind(this);
  return boundUserInfos(...args);
}

Meteor.publish('users-infos', publish);
