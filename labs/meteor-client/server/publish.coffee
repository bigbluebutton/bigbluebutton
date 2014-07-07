# Publish only the users that are in the particular meetingId
# On the client side we pass the meetingId parameter
Meteor.publish 'users', (meetingId) ->
  Meteor.Users.find({meetingId: meetingId})

Meteor.publish 'chat', (meetingId) ->
  Meteor.Chat.find({meetingId: meetingId})

Meteor.publish 'shapes', (meetingId) ->
  Meteor.Shapes.find({meetingId: meetingId})
