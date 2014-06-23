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

  # should be changed to find all users listed in the meeting and retrieve them,
  # instead of here where we retrieve every user pointing to the meeting 
  getUsersInMeeting: ->
    m = Meteor.Users.find {meetingId: Session.get("meetingId")}
    console.log m
    m

  getMeetingSize: ->
    m = Meteor.Users.find({meetingId: Session.get("meetingId")}).fetch()
    if m? then m?.length else "error"
