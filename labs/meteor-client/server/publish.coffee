
Meteor.publish 'users', (meetingId) ->
  console.log "\n\nKK" + meetingId + "KK\n\n"

  Meteor.users.find({meetingId: meetingId})