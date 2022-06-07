import { check } from 'meteor/check';
import Users from '/imports/api/users';
import VideoStreams from '/imports/api/video-streams';
import Logger from '/imports/startup/server/logger';
import setloggedOutStatus from '/imports/api/users-persistent-data/server/modifiers/setloggedOutStatus';
import clearUserInfoForRequester from '/imports/api/users-infos/server/modifiers/clearUserInfoForRequester';
import ClientConnections from '/imports/startup/server/ClientConnections';
import UsersPersistentData from '/imports/api/users-persistent-data';
import VoiceUsers from '/imports/api/voice-users/';

const clearAllSessions = (sessionUserId) => {
  const serverSessions = Meteor.server.sessions;
  const interable = serverSessions.values();

  for (const session of interable) {
    if (session.userId === sessionUserId) {
      session.close();
    }
  }
};

export default function removeUser(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);

  try {
    // we don't want to fully process the redis message in frontend
    // since the backend is supposed to update Mongo
    if ((process.env.BBB_HTML5_ROLE !== 'frontend')) {
      const selector = {
        meetingId,
        userId,
      };

      setloggedOutStatus(userId, meetingId, true);
      VideoStreams.remove({ meetingId, userId });

      clearUserInfoForRequester(meetingId, userId);

      const currentUser = Users.findOne({ userId, meetingId });
      const hasMessages = currentUser?.hasMessages;
  
      if (!hasMessages) {
        UsersPersistentData.remove(selector);
      }
      Users.remove(selector);
      VoiceUsers.remove({ intId: userId, meetingId });
    }

    if (!process.env.BBB_HTML5_ROLE || process.env.BBB_HTML5_ROLE === 'frontend') {
      const sessionUserId = `${meetingId}--${userId}`;
      ClientConnections.removeClientConnection(sessionUserId);
      clearAllSessions(sessionUserId);
    }

    Logger.info(`Removed user id=${userId} meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Removing user from Users collection: ${err}`);
  }
}
