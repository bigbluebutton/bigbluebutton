import { check } from 'meteor/check';
import Users from '/imports/api/users';
import VideoStreams from '/imports/api/video-streams';
import Logger from '/imports/startup/server/logger';
import setloggedOutStatus from '/imports/api/users-persistent-data/server/modifiers/setloggedOutStatus';
import stopWatchingExternalVideoSystemCall from '/imports/api/external-videos/server/methods/stopWatchingExternalVideoSystemCall';
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
      stopWatchingExternalVideoSystemCall({ meetingId, requesterUserId: 'system-presenter-was-removed' });
    }
  }

  const selector = {
    meetingId,
    userId,
  };

  try {
    setloggedOutStatus(userId, meetingId, true);
    VideoStreams.remove({ meetingId, userId });
    const sessionUserId = `${meetingId}-${userId}`;

    ClientConnections.removeClientConnection(`${meetingId}--${userId}`);

    clearAllSessions(sessionUserId);

    clearUserInfoForRequester(meetingId, userId);

    Users.remove(selector);

    Logger.info(`Removed user id=${userId} meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Removing user from Users collection: ${err}`);
  }
}
