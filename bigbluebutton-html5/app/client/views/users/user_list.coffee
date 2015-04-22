Template.usersList.helpers
  getInfoNumberOfUsers: ->
    numberUsers = Meteor.Users.find().count()
    if numberUsers > 8
      return "Users: #{numberUsers}"
    # do not display the label if there are just a few users
