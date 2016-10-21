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

  const cb = () => { Logger.info(`Removed Poll: (meetingId: ${meetingId}) (pollId: ${pollId})`); };

  return Polls.remove(selector, cb);
};
