Meteor.methods
  addMeetingToCollection: (meetingId, name, recorded) ->
    console.log "trying to add to Meetings:" + meetingId + '|' + name + "Meetings.size before:" + Meteor.Meetings.find().count()

    #check if the meeting is already in the collection
    unless Meteor.Meetings.findOne({meetingId: meetingId})?
      id = Meteor.Meetings.insert(meetingId: meetingId, meetingName: name, recorded: recorded)
      console.log "added meeting _id=[#{id}]:meetingId=[#{meetingId}]:name=[#{name}]. Meetings.size is now #{Meteor.Meetings.find().count()}"

  removeMeetingFromCollection: (meetingId) ->
    if Meteor.Meetings.findOne({meetingId: meetingId})?
      #must make sure that all users in the meeting are gone?! or this will be handled by kickAllUsers...
      if Meteor.Users.find({meetingId: meetingId}).count() isnt 0
        console.log "\n!!!!!removing a meeting which has active users in it!!!!\n"
      id = Meteor.Meetings.findOne({meetingId: meetingId})
      Meteor.Meetings.remove(id?._id)
      console.log "removed from Meetings:#{meetingId} now there are only #{} meetings running"
