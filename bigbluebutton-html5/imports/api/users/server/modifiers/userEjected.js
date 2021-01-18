import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import clearUserInfoForRequester from '/imports/api/users-infos/server/modifiers/clearUserInfoForRequester';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';
import upsertValidationState from '/imports/api/auth-token-validation/server/modifiers/upsertValidationState';

export default function userEjected(meetingId, userId, ejectedReason) {
  check(meetingId, String);
  check(userId, String);
  check(ejectedReason, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      ejected: true,
      ejectedReason,
    },
  };

  try {
    const numberAffected = Users.update(selector, modifier);

    if (numberAffected) {
      Meteor.setTimeout(() => {
        const lastAuthToken = AuthTokenValidation.findOne(
          { meetingId, userId },
          { fields: { connectionId: 1 }, sort: { updatedAt: -1 } },
        );
        upsertValidationState(meetingId, userId, ValidationStates.EJECTED, lastAuthToken.connectionId);
      }, 2000);
      clearUserInfoForRequester(meetingId, userId);
      Logger.info(`Ejected user id=${userId} meeting=${meetingId} reason=${ejectedReason}`);
    }
  } catch (err) {
    Logger.error(`Ejecting user from collection: ${err}`);
  }
}
