import { check } from 'meteor/check';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

export default function setConnectionIdAndAuthToken(meetingId, userId, connectionId, authToken) {
  check(meetingId, String);
  check(userId, String);
  check(authToken, String);
  check(connectionId, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      connectionId,
      authToken,
    },
  };

  try {
    const numberAffected = Users.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Updated connectionId and authToken user=${userId} connectionId=${connectionId} meeting=${meetingId} authToken=${authToken}`);
    }
  } catch (err) {
    Logger.error(`Updating connectionId user=${userId}: ${err}`);
  }
}
