Template.usersList.helpers
  users: ->
    Meteor.Users.find()

  getMeetingSize: -> # Retreieve the number of users in the chat, or "error" string
    Meteor.Users.find().count()
