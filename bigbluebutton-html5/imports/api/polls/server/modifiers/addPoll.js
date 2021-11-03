import Users from '/imports/api/users';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';
import flat from 'flat';
import { check } from 'meteor/check';

export default function addPoll(meetingId, requesterId, poll, pollType, secretPoll, question = '') {
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
    isMultipleResponse: Boolean,
  });

  const userSelector = {
    meetingId,
    userId: { $ne: requesterId },
    clientType: { $ne: 'dial-in-user' },
  };

  const userIds = Users.find(userSelector, { fields: { userId: 1 } })
    .fetch()
    .map(user => user.userId);

  const selector = {
    meetingId,
    requester: requesterId,
    id: poll.id,
  };

  const modifier = Object.assign(
    { meetingId },
    { requester: requesterId },
    { users: userIds },
    { question, pollType, secretPoll },
    flat(poll, { safe: true }),
  );


  try {
    const { insertedId } = Polls.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Added Poll id=${poll.id}`);
    } else {
      Logger.info(`Upserted Poll id=${poll.id}`);
    }
  } catch (err) {
    Logger.error(`Adding Poll to collection: ${poll.id}`);
  }
}
