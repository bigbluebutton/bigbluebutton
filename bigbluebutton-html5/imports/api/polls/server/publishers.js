import { Meteor } from 'meteor/meteor';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Polls from '/imports/api/polls';
import { check } from 'meteor/check';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('polls', (credentials) => {
  //checking if it is allowed to see Poll Collection in general
  if (!isAllowedTo('subscribePoll', credentials)) {
    this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'polls'"));
  }

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  //checking if it is allowed to see a number of votes (presenter only)
  if (isAllowedTo('subscribeAnswers', credentials)) {
    logger.info(`publishing Poll for presenter: ${meetingId} ${requesterUserId} ${requesterToken}`);
    return Polls.find({
      meetingId: meetingId,
      users: requesterUserId,
    });
  } else {
    logger.info(`publishing Poll for viewer: ${meetingId} ${requesterUserId} ${requesterToken}`);
    return Polls.find({
      meetingId: meetingId,
      users: requesterUserId,
    }, {
      fields: {
        'poll.answers.num_votes': 0,
      },
    });
  }
});
