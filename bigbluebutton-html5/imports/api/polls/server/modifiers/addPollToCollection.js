import Polls from '/imports/api/polls/collection';
import { logger } from '/imports/startup/server/logger';

export function addPollToCollection(poll, requesterId, users, meetingId) {
  // copying all the userids into an array
  let newUsers = [];
  newUsersLength = users.length;
  for (let i = 0; i < newUsersLength; i++) {
    const user = users[i];
    newUsers.push(user.user.userid);
  }

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
  const entry = {
    meetingId: meetingId,
    poll: poll,
    requester: requesterId,
    users: newUsers,
    num_responders: -1,
    num_respondents: -1,
  };
  logger.info(`added poll _id=[${poll.id}]:meetingId=[${meetingId}].`);
  return Polls.insert(entry);
};
