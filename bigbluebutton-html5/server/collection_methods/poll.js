this.addPollToCollection = function (poll, requester_id, users, meetingId) {
  let _users, answer, entry, i, j, user;

  //copying all the userids into an array
  _users = [];
  _users_length = users.length;
  for (i = 0; i < _users_length; i++) {
    user = users[i];
    _users.push(user.user.userid);
  }

  //adding the initial number of votes for each answer
  _answers = poll.answers;
  _answers_length = _answers.length;
  for (j = 0; j < _answers_length; j++) {
    answer = _answers[j];
    answer.num_votes = 0;
  }

  //adding the initial number of responders and respondents to the poll, which will be displayed for presenter (in HTML5 client) when he starts the poll
  poll.num_responders = -1;
  poll.num_respondents = -1;

  //adding all together and inserting into the Polls collection
  entry = {
    poll_info: {
      meetingId: meetingId,
      poll: poll,
      requester: requester_id,
      users: _users,
    },
  };
  Meteor.log.info(`added poll _id=[${poll.id}]:meetingId=[${meetingId}].`);
  return Meteor.Polls.insert(entry);
};

export function clearPollCollection() {
  const meetingId = arguments[0];
  const pollId = arguments[1];
  //TODO make it so you can delete the polls based only on meetingId
  if (meetingId != null && pollId != null && Meteor.Polls.findOne({
    'poll_info.meetingId': meetingId,
    'poll_info.poll.id': pollId,
  }) != null) {
    return Meteor.Polls.remove({
      'poll_info.meetingId': meetingId,
      'poll_info.poll.id': pollId,
    }, Meteor.log.info(`cleared Polls Collection (meetingId: ${meetingId}, pollId: ${pollId}!)`));
  } else {
    return Meteor.Polls.remove({}, Meteor.log.info('cleared Polls Collection (all meetings)!'));
  }
};

this.updatePollCollection = function (poll, meetingId, requesterId) {
  if ((poll.answers != null) && (poll.num_responders != null) && (poll.num_respondents != null) && (poll.id != null) && (meetingId != null) && (requesterId != null)) {
    return Meteor.Polls.update({
      'poll_info.meetingId': meetingId,
      'poll_info.requester': requesterId,
      'poll_info.poll.id': poll.id,
    }, {
      $set: {
        'poll_info.poll.answers': poll.answers,
        'poll_info.poll.num_responders': poll.num_responders,
        'poll_info.poll.num_respondents': poll.num_respondents,
      },
    }, Meteor.log.info(`updating Polls Collection (meetingId: ${meetingId}, pollId: ${poll.id}!)`));
  }
};
