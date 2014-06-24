Template.usersList.helpers
  users: ->
    Meteor.Users.find()

  getMeeting: ->
    m = Meetings.findOne {meetingName: Session.get("meetingId")}
    if m?
      #console.log m
      m
    else
      #console.log "nothing"
      null

  getMeetingSize: ->
    m = Meteor.Users.find({meetingId: Session.get("meetingId")}).fetch()
    if m? then m?.length else "error"
