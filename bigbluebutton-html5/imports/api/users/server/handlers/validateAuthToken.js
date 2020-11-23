import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import userJoin from './userJoin';
import pendingAuthenticationsStore from '../store/pendingAuthentications';
import createDummyUser from '../modifiers/createDummyUser';
import setConnectionIdAndAuthToken from '../modifiers/setConnectionIdAndAuthToken';

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
  } = body;

  check(userId, String);
  check(authToken, String);
  check(valid, Boolean);
  check(waitForApproval, Boolean);

  const pendingAuths = pendingAuthenticationsStore.take(meetingId, userId, authToken);

  if (!valid) {
    pendingAuths.forEach(
      (pendingAuth) => {
        try {
          const { methodInvocationObject } = pendingAuth;
          const connectionId = methodInvocationObject.connection.id;

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

  if (valid) {
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
        }

        setConnectionIdAndAuthToken(meetingId, userId, methodInvocationObject.connection.id, authToken);
        /* End of logic migrated from validateAuthToken */
      },
    );
  }

  const selector = {
    meetingId,
    userId,
    clientType: 'HTML5',
  };

  const User = Users.findOne(selector);

  // If we dont find the user on our collection is a flash user and we can skip
  if (!User) return;

  // Publish user join message
  if (valid && !waitForApproval) {
    Logger.info('User=', User);
    userJoin(meetingId, userId, User.authToken);
  }

  const modifier = {
    $set: {
      validated: valid,
      approved: !waitForApproval,
      loginTime: Date.now(),
      inactivityCheck: false,
    },
  };

  try {
    const numberAffected = Users.update(selector, modifier);

    if (numberAffected) {
      if (valid) {
        const sessionUserId = `${meetingId}-${userId}`;
        const currentConnectionId = User.connectionId ? User.connectionId : false;
        clearOtherSessions(sessionUserId, currentConnectionId);
      }

      Logger.info(`Validated auth token as ${valid} user=${userId} meeting=${meetingId}`);
    } else {
      Logger.info('No auth to validate');
    }
  } catch (err) {
    Logger.error(`Validating auth token: ${err}`);
  }
}
