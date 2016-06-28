import Users from '/imports/api/users';
import { logger } from '/imports/startup/server/logger';

//update a voiceUser - a helper method
export function updateVoiceUser(meetingId, voiceUserObject, callback) {
  let userObject;
  userObject = Users.findOne({
    userId: voiceUserObject.web_userid,
  });
  if (userObject != null) {
    if (voiceUserObject.talking != null) {
      Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.voiceUser.talking': voiceUserObject.talking,
        },
      }, (err, numChanged) => {
        if (err != null) {
          logger.error(
            `_unsucc update of voiceUser ${voiceUserObject.web_userid} ` +
            `[talking] err=${JSON.stringify(err)}`
          );
        }

        return callback();
      });
    }

    // talking
    if (voiceUserObject.joined != null) {
      Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.voiceUser.joined': voiceUserObject.joined,
        },
      }, (err, numChanged) => {
        if (err != null) {
          logger.error(
            `_unsucc update of voiceUser ${voiceUserObject.web_userid} ` +
            `[joined] err=${JSON.stringify(err)}`
          );
        }

        return callback();
      });
    }

    // joined
    if (voiceUserObject.locked != null) {
      Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.voiceUser.locked': voiceUserObject.locked,
        },
      }, (err, numChanged) => {
        if (err != null) {
          logger.error(
            `_unsucc update of voiceUser ${voiceUserObject.web_userid} ` +
            `[locked] err=${JSON.stringify(err)}`
          );
        }

        return callback();
      });
    }

    // locked
    if (voiceUserObject.muted != null) {
      Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.voiceUser.muted': voiceUserObject.muted,
        },
      }, (err, numChanged) => {
        if (err != null) {
          logger.error(
            `_unsucc update of voiceUser ${voiceUserObject.web_userid} ` +
            `[muted] err=${JSON.stringify(err)}`
          );
        }

        return callback();
      });
    }

    // muted
    if (voiceUserObject.listen_only != null) {
      return Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.listenOnly': voiceUserObject.listen_only,
        },
      }, (err, numChanged) => {
        if (err != null) {
          logger.error(
            `_unsucc update of voiceUser ${voiceUserObject.web_userid} ` +
            `[listenOnly] err=${JSON.stringify(err)}`
          );
        }

        return callback();
      });
    }

    // listenOnly
  } else {
    logger.error('ERROR! did not find such voiceUser!');
    return callback();
  }
};
