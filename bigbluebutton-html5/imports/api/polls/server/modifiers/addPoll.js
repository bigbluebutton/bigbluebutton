import Users from '/imports/api/users';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';
import flat from 'flat';
import { check } from 'meteor/check';

export default function addPoll(meetingId, requesterId, poll) {
  check(requesterId, String);
  check(meetingId, String);

  check(poll, {
    id: String,
    answers: [
      {
        id: Number,
        key: String,
      },
    ],
  });

  let selector = {
    meetingId,
  };

  const options = {
    fields: {
      userId: 1,
      _id: 0,
    },
  };

  const userIds = Users.find(selector, options)
    .fetch()
    .map(user => user.userId);

  selector = {
    meetingId,
    requester: requesterId,
    id: poll.id,
  };

  const modifier = Object.assign(
    { meetingId },
    { requester: requesterId },
    { users: userIds },
    flat(poll, { safe: true }),
  );

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
}
