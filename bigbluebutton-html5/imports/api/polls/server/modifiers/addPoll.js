import Polls from '/imports/api/polls';
import { logger } from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function addPoll(poll, requesterId, users, meetingId) {
  check(poll, Object);
  check(requesterId, String);
  check(users, Array);
  check(meetingId, String);

  const userIds = users.map(user => user.user.userid);

  // adding the initial number of votes for each answer
  // _answers = poll.answers;
  // _answers_length = _answers.length;
  // for (j = 0; j < _answers_length; j++) {
  //   answer = _answers[j];
  //   answer.num_votes = 0;
  // }

  // adding the initial number of responders and respondents to the poll, which will be displayed
  // for presenter (in HTML5 client) when they start the poll
  numResponders = -1;
  numRespondents = -1;

  // adding all together and inserting into the Polls collection
  const newPoll = {
    meetingId: meetingId,
    poll: poll,
    requester: requesterId,
    users: userIds,
    num_responders: -1,
    num_respondents: -1,
  };
  logger.info(`added poll _id=[${poll.id}]:meetingId=[${meetingId}].`);
  return Polls.insert(newPoll);
};
