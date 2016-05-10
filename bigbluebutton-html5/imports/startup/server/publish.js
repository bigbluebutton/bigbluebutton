import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { WhiteboardCleanStatus, Polls } from '/imports/startup/collections';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('bbb_poll', function (meetingId, userid, authToken) {
  //checking if it is allowed to see Poll Collection in general
  if (isAllowedTo('subscribePoll', meetingId, userid, authToken)) {
    //checking if it is allowed to see a number of votes (presenter only)
    if (isAllowedTo('subscribeAnswers', meetingId, userid, authToken)) {
      logger.info('publishing Poll for presenter: ' + meetingId + ' ' + userid + ' ' + authToken);
      return Polls.find({
        'poll_info.meetingId': meetingId,
        'poll_info.users': userid,
      });
    } else {
      logger.info('publishing Poll for viewer: ' + meetingId + ' ' + userid + ' ' + authToken);
      return Polls.find({
        'poll_info.meetingId': meetingId,
        'poll_info.users': userid,
      }, {
        fields: {
          'poll_info.poll.answers.num_votes': 0,
        },
      });
    }
  } else {
    this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'bbb_poll'"));
  }
});

Meteor.publish('whiteboard-clean-status', function (meetingId) {
  logger.info(`whiteboard clean status ${meetingId}`);
  return WhiteboardCleanStatus.find({
    meetingId: meetingId,
  });
});
