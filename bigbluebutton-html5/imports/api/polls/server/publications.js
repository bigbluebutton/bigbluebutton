import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Polls from '/imports/api/polls';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('polls', function (credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  //checking if it is allowed to see Poll Collection in general
  if (isAllowedTo('subscribePoll', credentials)) {
    //checking if it is allowed to see a number of votes (presenter only)
    if (isAllowedTo('subscribeAnswers', credentials)) {
      logger.info('publishing Poll for presenter: ' + meetingId + ' ' + requesterUserId + ' ' + requesterToken);
      return Polls.find({
        'poll_info.meetingId': meetingId,
        'poll_info.users': requesterUserId,
      });
    } else {
      logger.info('publishing Poll for viewer: ' + meetingId + ' ' + requesterUserId + ' ' + requesterToken);
      return Polls.find({
        'poll_info.meetingId': meetingId,
        'poll_info.users': requesterUserId,
      }, {
        fields: {
          'poll_info.poll.answers.num_votes': 0,
        },
      });
    }
  } else {
    this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'polls'"));
  }
});
