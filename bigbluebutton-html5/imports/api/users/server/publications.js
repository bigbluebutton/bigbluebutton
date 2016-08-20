import Users from '/imports/api/users';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { logger } from '/imports/startup/server/logger';
import { requestUserLeaving } from '/imports/api/users/server/modifiers/requestUserLeaving';

// Publish only the online users that are in the particular meetingId
// Also contains reconnection and connection_status info
Meteor.publish('users', function (credentials) {
  const meetingId = credentials.meetingId;
  const userid = credentials.requesterUserId;
  const authToken = credentials.requesterToken;

  logger.info(`attempt publishing users for ${meetingId}, ${userid}, ${authToken}`);
  const userObject = Users.findOne({
    userId: userid,
    meetingId: meetingId,
  });

  if (!!userObject && !!userObject.user) {
    let username = 'UNKNOWN';
    if (isAllowedTo('subscribeUsers', credentials)) {
      logger.info(`${userid} was allowed to subscribe to 'users'`);
      username = userObject.user.name;

      // offline -> online
      if (userObject.user.connection_status !== 'online') {
        Meteor.call('validateAuthToken', credentials);
        setConnectionStatus(meetingId, userid, 'online');
      }

      this._session.socket.on('close', Meteor.bindEnvironment((function (_this) {
        return function () {
          logger.info(`a user lost connection: session.id=${_this._session.id}` +
              ` userId = ${userid}, username=${username}, meeting=${meetingId}`);
          setConnectionStatus(meetingId, userid, 'offline');
          return requestUserLeaving(meetingId, userid);
        };
      })(this)));

      return getUsers(meetingId);
    } else {
      logger.warn('was not authorized to subscribe to users');
      return this.error(new Meteor.Error(402, 'User was not authorized to subscribe to users'));
    }
  } else { //subscribing before the user was added to the collection
    Meteor.call('validateAuthToken', credentials);
    logger.info(`Sending validateAuthTokenthere for user ${userid} in ${meetingId}.`);
    return getUsers(meetingId);
  }
});

const getUsers = function (meetingId) {
  //publish the users which are not offline
  return Users.find({
    meetingId: meetingId,
    'user.connection_status': {
      $in: ['online', ''],
    },
  }, {
    fields: {
      authToken: false,
    },
  });
};

const setConnectionStatus = function (meetingId, userId, statusStr) {
  Users.update({
    meetingId: meetingId,
    userId: userId,
  }, {
    $set: {
      'user.connection_status': statusStr,
    },
  }, (err, numChanged) => {
    logger.info(`User ${userId} in ${meetingId} goes ${statusStr}`);
  });
};
