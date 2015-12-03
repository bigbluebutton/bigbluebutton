# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@initializeCursor = (meetingId) ->
  Meteor.Cursor.upsert({meetingId:meetingId}, {
    meetingId:meetingId
    x:0
    y:0
  }, (err, numChanged) ->
    if err
      Meteor.log.error "err upserting cursor for #{meetingId}"
    else
      # Meteor.log.info "ok upserting cursor for #{meetingId}"
  )

@updateCursorLocation = (meetingId, cursorObject) ->
  Meteor.Cursor.update({meetingId:meetingId}, {$set:{
    x:cursorObject.x
    y:cursorObject.y
  }}, (err, numChanged) ->
      if err?
        Meteor.log.error "_unsucc update of cursor for #{meetingId} #{JSON.stringify cursorObject}
          err=#{JSON.stringify err}"
      else
        # Meteor.log.info "updated cursor for #{meetingId} #{JSON.stringify cursorObject}"
  )

# called on server start and meeting end
@clearCursorCollection = (meetingId) ->
  if meetingId?
    Meteor.Cursor.remove {meetingId: meetingId}, ->
      Meteor.log.info "cleared Cursor Collection (meetingId: #{meetingId})!"
  else
    Meteor.Cursor.remove {}, ->
      Meteor.log.info "cleared Cursor Collection (all meetings)!"

# --------------------------------------------------------------------------------------------
# end Private methods on server
# --------------------------------------------------------------------------------------------
