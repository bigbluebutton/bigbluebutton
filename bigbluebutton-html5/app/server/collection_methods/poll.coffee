# --------------------------------------------------------------------------------------------
# Public methods on server
# --------------------------------------------------------------------------------------------
Meteor.methods

  publishVoteMessage: (meetingId, pollAnswerId, requesterUserId, requesterToken) ->
    if isAllowedTo("subscribePoll", meetingId, requesterUserId, requesterToken)
      eventName = "vote_poll_user_request_message"

      result = Meteor.Polls.findOne({"poll_info.users": requesterUserId, "poll_info.meetingId": meetingId, "poll_info.poll.answers.id": pollAnswerId},
        {fields: {"poll_info.poll.id": 1, _id: 0}})
      _poll_id = result.poll_info.poll.id

      if eventName? and meetingId? and requesterUserId? and _poll_id? and pollAnswerId?
        message =
          header:
            timestamp: new Date().getTime()
            name: eventName
          payload:
            meeting_id: meetingId
            user_id: requesterUserId
            poll_id: _poll_id
            question_id: 0
            answer_id: pollAnswerId

        Meteor.Polls.update({"poll_info.users": requesterUserId, "poll_info.meetingId": meetingId, "poll_info.poll.answers.id": pollAnswerId},
          { $pull: {"poll_info.users": requesterUserId}});

        Meteor.log.info "publishing Poll response to redis"
        publish Meteor.config.redis.channels.toBBBApps.polling, message


# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@addPollToCollection = (poll, requester_id, users, meetingId) ->
  #copying all the userids into an array
  _users = []
  for user in users
    _users.push user.user.userid
  #adding the initial number of votes for each answer
  for answer in poll.answers
    answer.num_votes = 0
  #adding the initial number of responders and respondents to the poll, which will be displayed for presenter (in HTML5 client) when he starts the poll
  poll.num_responders = -1
  poll.num_respondents = -1

  #adding all together and inserting into the Polls collection
  entry =
    poll_info:
      "meetingId": meetingId
      "poll": poll
      "requester": requester_id
      "users": _users
  Meteor.log.info "added poll _id=[#{poll.id}]:meetingId=[#{meetingId}]."
  Meteor.Polls.insert(entry)

@clearPollCollection = (meetingId, poll_id) ->
  if meetingId? and poll_id? and Meteor.Polls.findOne({"poll_info.meetingId": meetingId, "poll_info.poll.id": poll_id})?
    Meteor.Polls.remove({
      "poll_info.meetingId": meetingId, 
      "poll_info.poll.id": poll_id}, 
      Meteor.log.info "cleared Polls Collection (meetingId: #{meetingId}, pollId: #{poll_id}!)")
  else
    Meteor.Polls.remove({}, Meteor.log.info "cleared Polls Collection (all meetings)!")

@updatePollCollection = (poll, meetingId, requesterId) ->
  if poll.answers? and poll.num_responders? and poll.num_respondents? and poll.id? and meetingId? and requesterId?
    Meteor.Polls.update({"poll_info.meetingId": meetingId, "poll_info.requester": requesterId, "poll_info.poll.id": poll.id},
      {$set:
        {"poll_info.poll.answers": poll.answers, "poll_info.poll.num_responders": poll.num_responders, "poll_info.poll.num_respondents": poll.num_respondents}
      }, Meteor.log.info "updating Polls Collection (meetingId: #{meetingId}, pollId: #{poll.id}!)")
