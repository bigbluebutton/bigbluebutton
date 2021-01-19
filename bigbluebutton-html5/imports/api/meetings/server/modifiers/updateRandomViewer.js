import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function updateRandomUser(meetingId, userId, requesterId) {
  check(meetingId, String);
  check(userId, String);
  check(requesterId, String);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      randomlySelectedUser: userId,
    },
  };

  try {
    const { insertedId } = Meetings.upsert(selector, modifier);
    if (insertedId) {
      Logger.info(`Set randomly selected userId=${userId} by requesterId=${requesterId} in meeitingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Setting randomly selected userId=${userId} by requesterId=${requesterId} in meetingId=${meetingId}`);
  }
}
