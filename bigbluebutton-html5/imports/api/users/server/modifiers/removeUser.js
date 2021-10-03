import { check } from 'meteor/check';
import Users from '/imports/api/users';
import VideoStreams from '/imports/api/video-streams';
import Logger from '/imports/startup/server/logger';
import setloggedOutStatus from '/imports/api/users-persistent-data/server/modifiers/setloggedOutStatus';
import clearUserInfoForRequester from '/imports/api/users-infos/server/modifiers/clearUserInfoForRequester';
import ClientConnections from '/imports/startup/server/ClientConnections';

const clearAllSessions = (sessionUserId) => {
  const serverSessions = Meteor.server.sessions;
  Object.keys(serverSessions)
    .filter((i) => serverSessions[i].userId === sessionUserId)
    .forEach((i) => serverSessions[i].close());
};

export default function removeUser(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);

  try {
    if (!process.env.BBB_HTML5_ROLE || process.env.BBB_HTML5_ROLE === 'frontend') {
      const sessionUserId = `${meetingId}-${userId}`;
      ClientConnections.removeClientConnection(`${meetingId}--${userId}`);
      clearAllSessions(sessionUserId);

      // we don't want to fully process the redis message in frontend
      // since the backend is supposed to update Mongo
      if (process.env.BBB_HTML5_ROLE === 'frontend') {
        return;
      }
    }

    const selector = {
      meetingId,
      userId,
    };

    setloggedOutStatus(userId, meetingId, true);
    VideoStreams.remove({ meetingId, userId });

    clearUserInfoForRequester(meetingId, userId);

    Users.remove(selector);

    Logger.info(`Removed user id=${userId} meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Removing user from Users collection: ${err}`);
  }
}
