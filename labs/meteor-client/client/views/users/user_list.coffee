Template.usersList.helpers
  users: ->
    Meteor.Users.find()

  getMeeting: ->
    m = Meetings.findOne {meetingName: Session.get("meetingId")}
    if m? then m else null

  getMeetingSize: ->
    m = Meteor.Users.find({meetingId: Session.get("meetingId")}).fetch()
    if m? then m?.length else "error"
