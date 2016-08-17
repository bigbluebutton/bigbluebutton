import { publish } from '/imports/api/common/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/api/common/server/helpers';
import Polls from '/imports/api/polls';
import { logger } from '/imports/startup/server/logger';

Meteor.methods({
  publishVoteMessage(credentials, pollId, pollAnswerId) { //TODO discuss location
    const REDIS_CONFIG = Meteor.settings.redis;
    if (isAllowedTo('subscribePoll', credentials)) {
      const { meetingId, requesterUserId, requesterToken } = credentials;
      const eventName = 'vote_poll_user_request_message';

      const result = Polls.findOne({
        users: requesterUserId,
        meetingId: meetingId,
        'poll.answers.id': pollAnswerId,
        'poll.id': pollId,
      });

      if ((meetingId != null) &&
        (result.meetingId != null) &&
        (requesterUserId != null) &&
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
          users: requesterUserId,
          meetingId: meetingId,
          'poll.answers.id': pollAnswerId,
        }, {
          $pull: {
            users: requesterUserId,
          },
        });
        message = appendMessageHeader(eventName, message);
        logger.info('publishing Poll response to redis');
        return publish(REDIS_CONFIG.channels.toBBBApps.polling, message);
      }
    }
  },
});
