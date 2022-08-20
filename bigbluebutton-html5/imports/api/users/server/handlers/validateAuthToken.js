import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import userJoin from './userJoin';
import pendingAuthenticationsStore from '../store/pendingAuthentications';
import createDummyUser from '../modifiers/createDummyUser';
import updateUserConnectionId from '../modifiers/updateUserConnectionId';
import ClientConnections from '/imports/startup/server/ClientConnections';

import upsertValidationState from '/imports/api/auth-token-validation/server/modifiers/upsertValidationState';
import { ValidationStates } from '/imports/api/auth-token-validation';

const clearOtherSessions = (sessionUserId, current = false) => {
  const serverSessions = Meteor.server.sessions;
  Object.keys(serverSessions)
    .filter(i => serverSessions[i].userId === sessionUserId)
    .filter(i => i !== current)
    .forEach(i => serverSessions[i].close());
};

export default function handleValidateAuthToken({ body }, meetingId) {
  const {
    userId,
    valid,
    authToken,
    waitForApproval,
    registeredOn,
    authTokenValidatedOn,
    reasonCode,
  } = body;

  check(userId, String);
  check(authToken, String);
  check(valid, Boolean);
  check(waitForApproval, Boolean);
  check(registeredOn, Number);
  check(authTokenValidatedOn, Number);
  check(reasonCode, String);

  const pendingAuths = pendingAuthenticationsStore.take(meetingId, userId, authToken);
  Logger.info(`PendingAuths length [${pendingAuths.length}]`);
  if (pendingAuths.length === 0) return;

  if (!valid) {
    pendingAuths.forEach(
      (pendingAuth) => {
        try {
          const { methodInvocationObject } = pendingAuth;
          const connectionId = methodInvocationObject.connection.id;

          upsertValidationState(meetingId, userId, ValidationStates.INVALID, connectionId, reasonCode);

          // Schedule socket disconnection for this user, giving some time for client receiving the reason of disconnection
          Meteor.setTimeout(() => {
            methodInvocationObject.connection.close();
          }, 2000);

          Logger.info(`Closed connection ${connectionId} due to invalid auth token.`);
        } catch (e) {
          Logger.error(`Error closing socket for meetingId '${meetingId}', userId '${userId}', authToken ${authToken}`);
        }
      },
    );

    return;
  }

  // Define user ID on connections
  pendingAuths.forEach(
    (pendingAuth) => {
      const { methodInvocationObject } = pendingAuth;

      /* Logic migrated from validateAuthToken method ( postponed to only run in case of success response ) - Begin */
      const sessionId = `${meetingId}--${userId}`;

      methodInvocationObject.setUserId(sessionId);

      const User = Users.findOne({
        meetingId,
        userId,
      });

      if (!User) {
        createDummyUser(meetingId, userId, authToken);
      }else{
        updateUserConnectionId(meetingId, userId, methodInvocationObject.connection.id);
      }

      ClientConnections.add(sessionId, methodInvocationObject.connection);
      upsertValidationState(meetingId, userId, ValidationStates.VALIDATED, methodInvocationObject.connection.id);

      /* End of logic migrated from validateAuthToken */
    },
  );

  const selector = {
    meetingId,
    userId,
    clientType: 'HTML5',
  };

  const User = Users.findOne(selector);

  // If we dont find the user on our collection is a flash user and we can skip
  if (!User) return;

  // Publish user join message
  if (!waitForApproval) {
    Logger.info('User=', User);
    userJoin(meetingId, userId, User.authToken);
  }

  const modifier = {
    $set: {
      validated: valid,
      approved: !waitForApproval,
      loginTime: registeredOn,
      authTokenValidatedTime: authTokenValidatedOn,
      inactivityCheck: false,
    },
  };

  try {
    const numberAffected = Users.update(selector, modifier);

    if (numberAffected) {
      const sessionUserId = `${meetingId}-${userId}`;
      const currentConnectionId = User.connectionId ? User.connectionId : false;
      clearOtherSessions(sessionUserId, currentConnectionId);

      Logger.info(`Validated auth token as ${valid} user=${userId} meeting=${meetingId}`);
    } else {
      Logger.info('No auth to validate');
    }
  } catch (err) {
    Logger.error(`Validating auth token: ${err}`);
  }
}
