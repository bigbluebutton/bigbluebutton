import { check } from 'meteor/check';
import Users from '/imports/api/users';
import VideoStreams from '/imports/api/video-streams';
import Logger from '/imports/startup/server/logger';
import stopWatchingExternalVideo from '/imports/api/external-videos/server/methods/stopWatchingExternalVideo';
import clearUserInfoForRequester from '/imports/api/users-infos/server/modifiers/clearUserInfoForRequester';

const clearAllSessions = (sessionUserId) => {
  const serverSessions = Meteor.server.sessions;
  Object.keys(serverSessions)
    .filter(i => serverSessions[i].userId === sessionUserId)
    .forEach(i => serverSessions[i].close());
};

export default function removeUser(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);

  const userToRemove = Users.findOne({ userId });

  if (userToRemove) {
    const { presenter } = userToRemove;
    if (presenter) {
      stopWatchingExternalVideo({ meetingId, requesterUserId: userId });
    }
  }

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

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing user from collection: ${err}`);
    }

    const sessionUserId = `${meetingId}-${userId}`;
    clearAllSessions(sessionUserId);

    clearUserInfoForRequester(meetingId, userId);

    return Logger.info(`Removed user id=${userId} meeting=${meetingId}`);
  };
  VideoStreams.remove({ meetingId, userId });
  return Users.update(selector, modifier, cb);
}
