import { check } from 'meteor/check';
import Users from '/imports/api/users';
import VideoStreams from '/imports/api/video-streams';
import Logger from '/imports/startup/server/logger';
import setloggedOutStatus from '/imports/api/users-persistent-data/server/modifiers/setloggedOutStatus';
import clearUserInfoForRequester from '/imports/api/users-infos/server/modifiers/clearUserInfoForRequester';
import ClientConnections from '/imports/startup/server/ClientConnections';
import UsersPersistentData from '/imports/api/users-persistent-data';
import VoiceUsers from '/imports/api/voice-users/';

const disconnectUser = (meetingId, userId) => {
  const sessionUserId = `${meetingId}--${userId}`;
  ClientConnections.removeClientConnection(sessionUserId);

  const serverSessions = Meteor.server.sessions;
  const interable = serverSessions.values();

  for (const session of interable) {
    if (session.userId === sessionUserId) {
      Logger.info(`Removed session id=${userId} meeting=${meetingId}`);
      session.close();
    }
  }
};

export default function removeUser(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);

  try {
    const selector = {
      meetingId,
      userId,
    };

    // we don't want to fully process the redis message in frontend
    // since the backend is supposed to update Mongo
    if ((process.env.BBB_HTML5_ROLE !== 'frontend')) {
      setloggedOutStatus(userId, meetingId, true);
      VideoStreams.remove({ meetingId, userId });

      clearUserInfoForRequester(meetingId, userId);

      const currentUser = UsersPersistentData.findOne({ userId, meetingId });
      const hasMessages = currentUser?.shouldPersist?.hasMessages;
      const hasConnectionStatus = currentUser?.shouldPersist?.hasConnectionStatus;

      if (!hasMessages && !hasConnectionStatus) {
        UsersPersistentData.remove(selector);
      }
      Users.remove(selector);
      VoiceUsers.remove({ intId: userId, meetingId });
    }

    if (!process.env.BBB_HTML5_ROLE || process.env.BBB_HTML5_ROLE === 'frontend') {

      //Wait for user removal and then kill user connections and sessions
      const queryCurrentUser = Users.find(selector);
      if (queryCurrentUser.count() === 0) {
        disconnectUser(meetingId, userId);
      } else {
        let queryUserObserver = queryCurrentUser.observeChanges({
          removed() {
            disconnectUser(meetingId, userId);
            queryUserObserver.stop();
          },
        });
      }
    }

    Logger.info(`Removed user id=${userId} meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Removing user from Users collection: ${err}`);
  }
}
