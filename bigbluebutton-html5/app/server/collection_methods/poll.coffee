# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@addPollToCollection = (payload) ->
  console.log "showing a message"
  console.log payload

@clearPollCollection = (meetingId) ->
  if meetingId?
    Meteor.Polls.remove({meetingId: meetingId}, Meteor.log.info "cleared Polls Collection (meetingId: #{meetingId}!")
  else
    Meteor.Polls.remove({}, Meteor.log.info "cleared Polls Collection (all Polls)!")