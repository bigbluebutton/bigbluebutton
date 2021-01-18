import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import { extractCredentials } from '/imports/api/common/server/helpers';
import ClientConnections from '/imports/startup/server/ClientConnections';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';
import upsertValidationState from '/imports/api/auth-token-validation/server/modifiers/upsertValidationState';

export default function userLeftMeeting() { // TODO-- spread the code to method/modifier/handler
  // so we don't update the db in a method
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const selector = {
    meetingId,
    userId: requesterUserId,
  };

  try {
    const numberAffected = Users.update(selector, { $set: { loggedOut: true } });

    if (numberAffected) {
      Logger.info(`user left id=${requesterUserId} meeting=${meetingId}`);
    }
    ClientConnections.removeClientConnection(this.userId, this.connection.id);

    Users.update(
      selector,
      {
        $set: {
          loggedOut: true,
        },
      },
    );

    Meteor.setTimeout(() => {
      const lastAuthToken = AuthTokenValidation.findOne(
        { meetingId, userId: requesterUserId },
        { fields: { connectionId: 1 }, sort: { updatedAt: -1 } },
      );
      upsertValidationState(meetingId, requesterUserId, ValidationStates.LOGGED_OUT, lastAuthToken.connectionId);
    }, 2000);
  } catch (err) {
    Logger.error(`leaving dummy user to collection: ${err}`);
  }
}
