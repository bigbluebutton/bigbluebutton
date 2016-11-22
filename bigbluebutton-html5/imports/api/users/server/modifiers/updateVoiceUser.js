import Users from '/imports/api/users';
import { logger } from '/imports/startup/server/logger';
import Logger from '/imports/startup/server/logger';

//update a voiceUser - a helper method
export function updateVoiceUser(meetingId, voiceUserObject, callback = () => {}) {
  check(meetingId, String);
  check(voiceUserObject, Object);

  let userObject;
  userObject = Users.findOne({
    userId: voiceUserObject.web_userid,
  });

  if (userObject) {
    const isTalking = voiceUserObject.talking;

    check(isTalking, Boolean);

    // talking
    //if (isTalking) {
      const selector = {
        meetingId,
        userId: voiceUserObject.web_userid,
      };

      const modifier = {
        $set: {
          'user.voiceUser.talking': isTalking,
        },
      };

      const cb = (err, numChanged) => {
        if (err) {
          logger.error(
              `_unsucc update of voiceUser ${voiceUserObject.web_userid} ` +
              `[talking] err=${JSON.stringify(err)}`
          );
        }

        return callback();
      };

      Logger.info(`user ${userObject.userId} talking ${isTalking}`);
      Users.update(selector, modifier, cb);
    //}

    // joined
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

    // locked
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

    // muted
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

    // listenOnly
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

  } else {
    logger.error('ERROR! did not find such voiceUser!');
    return callback();
  }
};
