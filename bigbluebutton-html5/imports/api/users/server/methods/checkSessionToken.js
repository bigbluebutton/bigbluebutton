import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';
import BannedUsers from '../store/bannedUsers';

export default function checkSessionToken(meetingId, requesterUserId, requesterToken, externalId) {
  // Check if externalId is banned from the meeting
  if (externalId) {
    if (BannedUsers.has(meetingId, externalId)) {
      Logger.warn(`A banned user with extId ${externalId} tried to enter in meeting ${meetingId}`);
      return { invalid: true, reason: 'User has been banned' };
    }
  }

  // Prevent users who have left or been ejected to use the same sessionToken again.
  const isUserInvalid = Users.findOne({
    meetingId,
    userId: requesterUserId,
    authToken: requesterToken,
    $or: [{ ejected: true }, { loggedOut: true }],
  });

  if (isUserInvalid) {
    Logger.warn(`An invalid sessionToken tried to validateAuthToken meetingId=${meetingId} authToken=${requesterToken}`);
    return { invalid: true, reason: 'User has an invalid sessionToken' };
  }

  return { invalid: false };
}
