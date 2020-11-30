import Polls from '/imports/api/polls';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function removePoll(meetingId, id) {
  check(meetingId, String);
  check(id, String);

  const selector = {
    meetingId,
    id,
  };

  try {
    const numberAffected = Polls.remove(selector);

    if (numberAffected) {
      Logger.info(`Removed Poll id=${id}`);
    }

  } catch (err) {
    Logger.error(`Removing Poll from collection: ${err}`);
  }
}
