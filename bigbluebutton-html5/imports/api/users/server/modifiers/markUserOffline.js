import Users from '/imports/api/users';
import { logger } from '/imports/startup/server/logger';

// Only callable from server
// Received information from BBB-Apps that a user left
// Need to update the collection
// params: meetingid,  userid as defined in BBB-Apps
// callback
export function markUserOffline(meetingId, userId, callback) {
  // mark the user as offline. remove from the collection on meeting_end #TODO
  let user = Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });

  if (user != null && user.clientType === 'HTML5') {
    logger.info(`marking html5 user [${userId}] as offline in meeting[${meetingId}]`);
    return Users.update({
      meetingId: meetingId,
      userId: userId,
    }, {
      $set: {
        'user.connection_status': 'offline',
        'user.voiceUser.talking': false,
        'user.voiceUser.joined': false,
        'user.voiceUser.muted': false,
        'user.time_of_joining': 0,
        'user.listenOnly': false, //TODO make this user: {}
      },
    }, (err, numChanged) => {
      let funct;
      if (err != null) {
        logger.error(
          `_unsucc update (mark as offline) of user ${user.user.name} ` +
          `${userId} err=${JSON.stringify(err)}`
        );
        return callback();
      } else {
        funct = function (cbk) {
          logger.info(
            `_marking as offline html5 user ${user.user.name} ` +
            `${userId}  numChanged=${numChanged}`
          );
          return cbk();
        };

        return funct(callback);
      }
    });
  } else {
    return Users.remove({
      meetingId: meetingId,
      userId: userId,
    }, (err, numDeletions) => {
      let funct;
      if (err != null) {
        logger.error(
          `_unsucc deletion of user ${user != null ? user.user.name : void 0} ` +
          `${userId} err=${JSON.stringify(err)}`
        );
        return callback();
      } else {
        funct = function (cbk) {
          logger.info(
            `_deleting info for user ${user != null ? user.user.name : void 0} ` +
            `${userId} numDeletions=${numDeletions}`
          );
          return cbk();
        };

        return funct(callback);
      }
    });
  }
};
