import { check } from 'meteor/check';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';

export default function userResponded({ body }) {
  const { pollId, userId, answerId } = body;

  check(pollId, String);
  check(userId, String);
  check(answerId, Number);

  const selector = {
    id: pollId,
  };

  const modifier = {
    $pull: {
      users: userId,
    },
    $push: {
      responses: { userId, answerId },
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Updating Poll responses: ${err}`);
    }

    return Logger.info(`Updating Poll response (userId: ${userId},
                                                response: ${answerId},
                                                pollId: ${pollId})`);
  };

  return Polls.update(selector, modifier, cb);
}
