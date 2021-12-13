import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import Polls from '/imports/api/polls';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function publishTypedVote(id, pollAnswer) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const MAX_INPUT_CHARS = Meteor.settings.public.poll.maxTypedAnswerLength;
  let EVENT_NAME = 'RespondToTypedPollReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(pollAnswer, String);
    check(id, String);

    const allowedToVote = Polls.findOne({
      id,
      users: { $in: [requesterUserId] },
      meetingId,
    }, {
      fields: {
        users: 1,
      },
    });

    if (!allowedToVote) {
      Logger.info(`Poll User={${requesterUserId}} has already voted in PollId={${id}}`);
      return null;
    }

    const activePoll = Polls.findOne({ meetingId, id }, {
      fields: {
        answers: 1,
      },
    });

    let existingAnsId = null;
    activePoll.answers.forEach((a) => {
      if (a.key === pollAnswer) existingAnsId = a.id;
    });
  
    if (existingAnsId !== null) {
      check(existingAnsId, Number);
      EVENT_NAME = 'RespondToPollReqMsg';

      return RedisPubSub.publishUserMessage(
        CHANNEL,
        EVENT_NAME,
        meetingId,
        requesterUserId,
        {
          requesterId: requesterUserId,
          pollId: id,
          questionId: 0,
          answerIds: [existingAnsId],
        },
      );
    }
  
    const payload = {
      requesterId: requesterUserId,
      pollId: id,
      questionId: 0,
      answer: pollAnswer.substring(0, MAX_INPUT_CHARS),
    };

    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method publishTypedVote ${err.stack}`);
  }
}
