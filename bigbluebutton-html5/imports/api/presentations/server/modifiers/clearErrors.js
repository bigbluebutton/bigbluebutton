import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function clearErrors(meetingId, userId, podId) {
  check(meetingId, String);
  check(userId, String);
  check(podId, String);

  const selector = {
    meetingId,
    podId,
    'conversion.error': true,
  };

  try {
    const numberAffected = Presentations.update(selector, { $set: { isCleared: true } });

    if (numberAffected) {
      Logger.info(`Presentation errors cleared by userId=${userId} meeting=${meetingId} podId=${podId}`);
    }
  } catch (err) {
    Logger.error(`Clearing presentation conversion errors from collection: ${err}`);
  }
}
