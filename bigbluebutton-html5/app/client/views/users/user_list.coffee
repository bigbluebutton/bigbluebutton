Template.usersList.helpers
  getInfoNumberOfUsers: ->
    numberUsers = Meteor.Users.find().count()
    if numberUsers > 4
      return "#{numberUsers} Users"
    # do not display the label if there are just a few users
