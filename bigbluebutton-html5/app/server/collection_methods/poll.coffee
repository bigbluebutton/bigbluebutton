# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@addPollToCollection = (poll, requester_id, users) ->
  entry =
    poll_info:
      "poll": poll
      "requester": requester_id
      "users": users
  Meteor.Polls.insert(entry)

@clearPollCollection = (meetingId) ->
  if meetingId?
    Meteor.Polls.remove({meetingId: meetingId}, Meteor.log.info "cleared Polls Collection (meetingId: #{meetingId}!")
  else
    Meteor.Polls.remove({}, Meteor.log.info "cleared Polls Collection (all Polls)!")