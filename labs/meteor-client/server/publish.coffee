# Publish only the users that are in the particular meetingId
# On the client side we pass the meetingId parameter
Meteor.publish 'users', (meetingId) ->
  Meteor.Users.find({meetingId: meetingId})
  