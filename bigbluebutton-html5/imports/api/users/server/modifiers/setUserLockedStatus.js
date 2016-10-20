import Users from '/imports/api/users';
import { logger } from '/imports/startup/server/logger';

// change the locked status of a user (lock settings)
export function setUserLockedStatus(meetingId, userId, isLocked) {
  let userObject;
  userObject = Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });
  if (userObject != null) {
    Users.update({
      userId: userId,
      meetingId: meetingId,
    }, {
      $set: {
        'user.locked': isLocked,
      },
    }, (err, numChanged) => {
      if (err != null) {
        return logger.error(`_error ${err} while updating user ${userId} with lock settings`);
      } else {
        return logger.info(
          `_setting user locked status for:[${userId}] ` +
          `from [${meetingId}] locked=${isLocked}`
        );
      }
    });

    // if the user is sharing audio, he should be muted upon locking involving disableMic
    if (userObject.user.role === 'VIEWER' && !userObject.user.listenOnly &&
        userObject.user.voiceUser.joined && !userObject.user.voiceUser.muted && isLocked) {
      // TODO why are we doing Meteor.call here?! Anton
      return Meteor.call('muteUser', meetingId, userObject.userId, userObject.userId,
          userObject.authToken, true); //true for muted
    }
  } else {
    let tempMsg = '(unsuccessful-no such user) setting user locked status for userid:';
    return logger.error(`${tempMsg}[${userId}] from [${meetingId}] locked=${isLocked}`);
  }
};
