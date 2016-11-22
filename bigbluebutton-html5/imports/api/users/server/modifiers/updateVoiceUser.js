import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

//update a voiceUser - a helper method
export function updateVoiceUser(meetingId, voiceUserObject, callback = () => {}) {
  check(meetingId, String);
  check(voiceUserObject, Object);

  const webUserId = voiceUserObject.web_userid;

  check(webUserId, String);

  let userObject = Users.findOne({
    userId: webUserId,
  });

  Logger.debug(`user ${userObject.userId} vu=${JSON.stringify(voiceUserObject)}`);

  check(userObject, Object);

  const selector = {
    meetingId,
    userId: webUserId,
  };

  const modifier = {
    $set: {
      'user.voiceUser.talking': voiceUserObject.talking || false,
      'user.voiceUser.joined': voiceUserObject.joined || false,
      'user.voiceUser.locked': voiceUserObject.locked || false,
      'user.voiceUser.muted': voiceUserObject.muted || false,
      'user.listenOnly': voiceUserObject.listen_only || false,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(
        `failed to update voiceUser ${JSON.stringify(voiceUserObject)} err=${JSON.stringify(err)}`
      );
    }

    return callback();
  };

  Users.update(selector, modifier, cb);
};
