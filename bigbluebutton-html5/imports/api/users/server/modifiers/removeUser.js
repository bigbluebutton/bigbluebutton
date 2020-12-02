import { check } from 'meteor/check';
import Users from '/imports/api/users';
import VideoStreams from '/imports/api/video-streams';
import Logger from '/imports/startup/server/logger';
import stopWatchingExternalVideo from '/imports/api/external-videos/server/methods/stopWatchingExternalVideo';
import clearUserInfoForRequester from '/imports/api/users-infos/server/modifiers/clearUserInfoForRequester';
import ClientConnections from '/imports/startup/server/ClientConnections';

const clearAllSessions = (sessionUserId) => {
  const serverSessions = Meteor.server.sessions;
  Object.keys(serverSessions)
    .filter(i => serverSessions[i].userId === sessionUserId)
    .forEach(i => serverSessions[i].close());
};

export default function removeUser(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);

  const userToRemove = Users.findOne({ userId, meetingId });

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

  try {
    VideoStreams.remove({ meetingId, userId });
    const sessionUserId = `${meetingId}-${userId}`;

    ClientConnections.removeClientConnection(`${meetingId}--${userId}`);

    clearAllSessions(sessionUserId);

    clearUserInfoForRequester(meetingId, userId);

    Users.remove(selector, cb);

    Logger.info(`Removed user id=${userId} meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Removing user from Users collection: ${err}`);
  }
}
