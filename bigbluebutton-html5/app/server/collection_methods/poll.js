Meteor.methods({
  publishVoteMessage(meetingId, pollAnswerId, requesterUserId, requesterToken) {
    let _poll_id, eventName, message, result;
    if (isAllowedTo("subscribePoll", meetingId, requesterUserId, requesterToken)) {
      eventName = "vote_poll_user_request_message";
      result = Meteor.Polls.findOne({
        "poll_info.users": requesterUserId,
        "poll_info.meetingId": meetingId,
        "poll_info.poll.answers.id": pollAnswerId
      }, {
        fields: {
          "poll_info.poll.id": 1,
          _id: 0
        }
      });
      _poll_id = result.poll_info.poll.id;
      if ((eventName != null) && (meetingId != null) && (requesterUserId != null) && (_poll_id != null) && (pollAnswerId != null)) {
        message = {
          header: {
            timestamp: new Date().getTime(),
            name: eventName
          },
          payload: {
            meeting_id: meetingId,
            user_id: requesterUserId,
            poll_id: _poll_id,
            question_id: 0,
            answer_id: pollAnswerId
          }
        };
        Meteor.Polls.update({
          "poll_info.users": requesterUserId,
          "poll_info.meetingId": meetingId,
          "poll_info.poll.answers.id": pollAnswerId
        }, {
          $pull: {
            "poll_info.users": requesterUserId
          }
        });
        Meteor.log.info("publishing Poll response to redis");
        return publish(Meteor.config.redis.channels.toBBBApps.polling, message);
      }
    }
  }
});

this.addPollToCollection = function(poll, requester_id, users, meetingId) {
  let _users, answer, entry, i, j, len, len1, ref, user;
  _users = [];
  for (i = 0, len = users.length; i < len; i++) {
    user = users[i];
    _users.push(user.user.userid);
  }
  ref = poll.answers;
  for (j = 0, len1 = ref.length; j < len1; j++) {
    answer = ref[j];
    answer.num_votes = 0;
  }
  poll.num_responders = -1;
  poll.num_respondents = -1;
  entry = {
    poll_info: {
      "meetingId": meetingId,
      "poll": poll,
      "requester": requester_id,
      "users": _users
    }
  };
  Meteor.log.info(`added poll _id=[${poll.id}]:meetingId=[${meetingId}].`);
  return Meteor.Polls.insert(entry);
};

this.clearPollCollection = function(meetingId, poll_id) {
  if ((meetingId != null) && (poll_id != null) && (Meteor.Polls.findOne({
    "poll_info.meetingId": meetingId,
    "poll_info.poll.id": poll_id
  }) != null)) {
    return Meteor.Polls.remove({
      "poll_info.meetingId": meetingId,
      "poll_info.poll.id": poll_id
    }, Meteor.log.info(`cleared Polls Collection (meetingId: ${meetingId}, pollId: ${poll_id}!)`));
  } else {
    return Meteor.Polls.remove({}, Meteor.log.info("cleared Polls Collection (all meetings)!"));
  }
};

this.updatePollCollection = function(poll, meetingId, requesterId) {
  if ((poll.answers != null) && (poll.num_responders != null) && (poll.num_respondents != null) && (poll.id != null) && (meetingId != null) && (requesterId != null)) {
    return Meteor.Polls.update({
      "poll_info.meetingId": meetingId,
      "poll_info.requester": requesterId,
      "poll_info.poll.id": poll.id
    }, {
      $set: {
        "poll_info.poll.answers": poll.answers,
        "poll_info.poll.num_responders": poll.num_responders,
        "poll_info.poll.num_respondents": poll.num_respondents
      }
    }, Meteor.log.info(`updating Polls Collection (meetingId: ${meetingId}, pollId: ${poll.id}!)`));
  }
};
