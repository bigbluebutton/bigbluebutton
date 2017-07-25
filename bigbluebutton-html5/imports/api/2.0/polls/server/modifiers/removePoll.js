import Polls from '/imports/api/2.0/polls';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function removePoll(meetingId, pollId) {
  check(meetingId, String);
  check(pollId, String);

  const selector = {
    meetingId,
    'poll.id': pollId,
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing Poll2x from collection: ${err}`);
    }

    return Logger.info(`Removed Poll2x id=${pollId}`);
  };

  return Polls.remove(selector, cb);
}
