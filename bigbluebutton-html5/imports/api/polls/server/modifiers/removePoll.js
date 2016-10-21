import Polls from '/imports/api/polls';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function removePoll(meetingId, pollId) {
  check(meetingId, String);
  check(pollId, String);

  const selector = {
    meetingId,
    'poll.id': pollId,
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Removing Poll from collection: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Removed Poll id=${pollId}`);
    }
  };

  return Polls.remove(selector, cb);
};
