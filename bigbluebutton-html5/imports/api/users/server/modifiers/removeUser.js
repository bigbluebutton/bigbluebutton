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

    /*
    Timeout added to reduce the probability that "userRemove" happens too close to "ejectUser",
    redirecting user to the wrong component.
    This is a workaround and should be removed as soon as a better fix is made
    see: https://github.com/bigbluebutton/bigbluebutton/pull/12057
    */
    const DELAY_USER_REMOVAL_TIMEOUT_MS = 1000;

    Meteor.wrapAsync((callback) => {
      Meteor.setTimeout(() => {
        Users.remove(selector);
        callback();
      }, DELAY_USER_REMOVAL_TIMEOUT_MS);
    })();

    Logger.info(`Removed user id=${userId} meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Removing user from Users collection: ${err}`);
  }
}
