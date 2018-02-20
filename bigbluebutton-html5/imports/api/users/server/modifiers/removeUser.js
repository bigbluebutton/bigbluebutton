import { check } from 'meteor/check';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';
import removeVoiceUser from '/imports/api/voice-users/server/modifiers/removeVoiceUser';

const CLIENT_TYPE_HTML = 'HTML5';

const clearAllSessions = (sessionUserId) => {
  const serverSessions = Meteor.server.sessions;
  Object.keys(serverSessions)
    .filter(i => serverSessions[i].userId === sessionUserId)
    .forEach(i => serverSessions[i].close());
};

export default function removeUser(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      connectionStatus: 'offline',
      validated: false,
      emoji: 'none',
      presenter: false,
      role: 'VIEWER',
    },
  };

  removeVoiceUser(meetingId, {
    voiceConf: '',
    voiceUserId: '',
    intId: userId,
  });

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing user from collection: ${err}`);
    }

    const sessionUserId = `${meetingId}-${userId}`;
    clearAllSessions(sessionUserId);

    return Logger.info(`Removed ${CLIENT_TYPE_HTML} user id=${userId} meeting=${meetingId}`);
  };

  return Users.update(selector, modifier, cb);
}
