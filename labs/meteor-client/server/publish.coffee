# Publish only the users that are in the particular meetingId
# On the client side we pass the meetingId parameter
Meteor.publish 'users', (meetingId) ->
  Meteor.Users.find({meetingId: meetingId})

Meteor.publish 'chat', (meetingId) ->
  Meteor.Chat.find({meetingId: meetingId})

Meteor.publish 'shapes', (meetingId) ->
  Meteor.Shapes.find({meetingId: meetingId})

Meteor.publish 'slides', (meetingId) ->
  Meteor.Slides.find({meetingId: meetingId})

Meteor.publish 'chatTabs', (userId) ->
  Meteor.ChatTabs.find({'belongsTo': userId})

Meteor.publish 'meetings', (meetingId) ->
  Meteor.Meetings.find({meetingId: meetingId})
