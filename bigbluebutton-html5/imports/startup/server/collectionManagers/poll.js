import { Polls } from '/collections/collections';
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

export function clearPollCollection() {
  const meetingId = arguments[0];
  const pollId = arguments[1];

  //TODO make it so you can delete the polls based only on meetingId
  if (meetingId != null && pollId != null && Polls.findOne({
    meetingId: meetingId,
    poll: { id: pollId },
  }) != null) {
    return Polls.remove({
      meetingId: meetingId,
      poll: { id: pollId },
    }, logger.info(`cleared Polls Collection (meetingId: ${meetingId}, pollId: ${pollId}!)`));
  } else {
    return Polls.remove({}, logger.info('cleared Polls Collection (all meetings)!'));
  }
};

export function updatePollCollection(poll, meetingId, requesterId) {
  if ((poll.answers != null) && (poll.numResponders != null) && (poll.numRespondents != null) &&
    (poll.id != null) && (meetingId != null) && (requesterId != null)) {
    return Polls.update({
      meetingId: meetingId,
      requester: requesterId,
      poll: { id: poll.id },
    }, {
      $set: {
        poll: { answers: poll.answers },
        poll: { num_responders: poll.numResponders },
        poll: { num_respondents: poll.numRespondents },
      },
    }, logger.info(`updating Polls Collection (meetingId: ${meetingId}, pollId: ${poll.id}!)`));
  }
};
