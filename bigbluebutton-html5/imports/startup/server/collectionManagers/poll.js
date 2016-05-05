import { Polls } from '/collections/collections';
import { logger } from '/imports/startup/server/logger';

export function addPollToCollection(poll, requester_id, users, meetingId) {
  let _users, answer, entry, i, j, user;

  // copying all the userids into an array
  _users = [];
  _users_length = users.length;
  for (i = 0; i < _users_length; i++) {
    user = users[i];
    _users.push(user.user.userid);
  }

  // adding the initial number of votes for each answer
  // _answers = poll.answers;
  // _answers_length = _answers.length;
  // for (j = 0; j < _answers_length; j++) {
  //   answer = _answers[j];
  //   answer.num_votes = 0;
  // }

  // adding the initial number of responders and respondents to the poll, which will be displayed for presenter (in HTML5 client) when he starts the poll
  num_responders = -1;
  num_respondents = -1;

  // adding all together and inserting into the Polls collection
  entry = {
    meetingId: meetingId,
    poll: poll,
    requester: requester_id,
    users: _users,
    num_responders: -1,
    num_respondents: -1,
  };
  logger.info(`added poll _id=[${poll.id}]:meetingId=[${meetingId}].`);
  return Polls.insert(entry);
};

export function clearPollCollection() {
  const meetingId = arguments[0];
  const poll_id = arguments[1];

  //TODO make it so you can delete the polls based only on meetingId
  if (meetingId != null && poll_id != null && Polls.findOne({
    'meetingId': meetingId,
    'poll.id': poll_id,
  }) != null) {
    return Polls.remove({
      'meetingId': meetingId,
      'poll.id': poll_id,
    }, logger.info(`cleared Polls Collection (meetingId: ${meetingId}, pollId: ${poll_id}!)`));
  } else {
    return Polls.remove({}, logger.info('cleared Polls Collection (all meetings)!'));
  }
};

export function updatePollCollection(poll, meetingId, requesterId) {
  if ((poll.answers != null) && (poll.num_responders != null) && (poll.num_respondents != null) && (poll.id != null) && (meetingId != null) && (requesterId != null)) {
    return Polls.update({
      'meetingId': meetingId,
      'requester': requesterId,
      'poll.id': poll.id,
    }, {
      $set: {
        'poll.answers': poll.answers,
        'poll.num_responders': poll.num_responders,
        'poll.num_respondents': poll.num_respondents,
      },
    }, logger.info(`updating Polls Collection (meetingId: ${meetingId}, pollId: ${poll.id}!)`));
  }
};
