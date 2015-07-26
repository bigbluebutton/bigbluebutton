# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@addPollToCollection = (poll, requester_id, users) ->
  _users = []
  i = 0
  while i < users.length
    _users.push users[i].user.userid
    i++

  entry =
    poll_info:
      "poll": poll
      "requester": requester_id
      "users": _users
  Meteor.Polls.insert(entry)

@clearPollCollection = (meetingId) ->
  if meetingId?
    Meteor.Polls.remove({meetingId: meetingId}, Meteor.log.info "cleared Polls Collection (meetingId: #{meetingId}!")
  else
    Meteor.Polls.remove({}, Meteor.log.info "cleared Polls Collection (all Polls)!")