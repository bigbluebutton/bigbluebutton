Template.usersList.helpers
  users: ->
    Meteor.Users.find()

  getMeetingSize: -> # Retreieve the number of users in the chat, or "error" string
    m = Meteor.Users.find({meetingId: Session.get("meetingId")}).fetch()
    if m? then m?.length else "error"
