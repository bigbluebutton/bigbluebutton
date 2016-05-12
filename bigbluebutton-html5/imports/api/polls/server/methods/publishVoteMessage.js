import { publish } from '/imports/startup/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/startup/server/helpers';
import Polls from '/imports/api/polls';
import { logger } from '/imports/startup/server/logger';
import { redisConfig } from '/config';

Meteor.methods({
  publishVoteMessage(pollId, pollAnswerId, meetingId, requesterUserId, requesterToken) { //TODO discuss location
    if (isAllowedTo('subscribePoll', meetingId, requesterUserId, requesterToken)) {
      const eventName = 'vote_poll_user_request_message';

      const result = Polls.findOne({
        users: { $in: [requesterUserId] },
        meetingId: meetingId,
        poll: { answers: { id: { $in: [pollAnswerId] } } },
        poll: { id: pollId },
      });

      if ((meetingId != null) && (result.meetingId != null) && (requesterUserId != null) &&
        (pollAnswerId != null)) {
        let message = {
          payload: {
            meeting_id: result.meetingId,
            user_id: requesterUserId,
            poll_id: result.poll.id,
            question_id: 0,
            answer_id: pollAnswerId,
          },
        };
        Polls.update({
          users: { $in: [requesterUserId] },
          meetingId: meetingId,
          poll: { answers: { id: { $in: [pollAnswerId] } } },
        }, {
          $pull: {
            users: requesterUserId,
          },
        });
        message = appendMessageHeader(eventName, message);
        logger.info('publishing Poll response to redis');
        return publish(redisConfig.channels.toBBBApps.polling, message);
      }
    }
  },
});
