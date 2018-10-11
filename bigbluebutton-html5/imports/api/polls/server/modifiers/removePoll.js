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

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing Poll from collection: ${err}`);
    }

    return Logger.info(`Removed Poll id=${id}`);
  };

  return Polls.remove(selector, cb);
}
