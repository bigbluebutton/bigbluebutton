import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function addPoll(meetingId, requesterId, poll) {
  check(poll, Object);
  check(requesterId, String);
  check(meetingId, String);

  let selector = {
    meetingId: meetingId,
  };

  const options = {
    fields: {
      'user.userid': 1,
      _id: 0,
    },
  };

  const userIds = Users.find(selector, options)
                       .fetch()
                       .map(user => user.user.userid);

  selector = {
    meetingId,
    requester: requesterId,
    'poll.id': poll.id,
  };

  const modifier = {
    meetingId,
    poll,
    requester: requesterId,
    users: userIds,
  };

  const cb = (err, numChanged) => {
    if (err != null) {
      return Logger.error(`Adding Poll to collection: ${poll.id}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added Poll id=${poll.id}`);
    }

    return Logger.info(`Upserted Poll id=${poll.id}`);
  };

  return Polls.upsert(selector, modifier, cb);
};
