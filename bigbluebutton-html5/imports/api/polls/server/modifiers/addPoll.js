import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function addPoll(poll, requesterId, users, meetingId) {
  check(poll, Object);
  check(requesterId, String);
  check(users, Array);

  if (meetingId) {
    check(meetingId, String);
  }

  const userIds = users.map(user => user.user.userid);

  const modifier = {
    meetingId,
    poll,
    requester: requesterId,
    users: userIds,
  };

  const cb = (err, numChanged) => {
    if (err != null) {
      return Logger.error(`Adding poll to collection: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added poll id=${poll.id}`);
    }

    return Logger.info(`Added poll id=${poll.id}`);
  };

  return Polls.insert(modifier, cb);
};
