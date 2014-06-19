postsData = [
  {
    title: "Introducing Telescope"
    author: "Sacha Greif"
    url: "http://sachagreif.com/introducing-telescope/"
  }
  {
    title: "Meteor"
    author: "Tom Coleman"
    url: "http://meteor.com"
  }
  {
    title: "The Meteor Book"
    author: "Tom Coleman"
    url: "http://themeteorbook.com"
  }
]
Template.usersList.helpers
  users: ->
    Meteor.users.find()

  getMeeting: ->
    console.log "meetingid = " + Session.get "meetingId"
    m = Meetings.findOne {meetingName: Session.get("meetingId")}
    if m?
      console.log m
      m
    else
      null

  # should be changed to find all users listed in the meeting and retrieve them,
  #  instead of here where we retrieve every user pointing to the meeting 
  getUsersInMeeting: ->
    Meteor.users.find {meetingId: Session.get("meetingId")}

  getMeetingSize: ->
    m = Meetings.findOne {meetingName: Session.get("meetingId")}
    if m?
      m.users?.length
    else
      "error"

Template.usersList.events "click input.signin": (event) ->
  Session.set "userId", event.target.id