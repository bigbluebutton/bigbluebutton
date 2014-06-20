Template.userItem.helpers
  domain: ->
    a = document.createElement("a")
    a.href = @url
    a.hostname

  isUserModerator: =>
    id = Session.get("userId") or "a1a1a1a1a1a1"
    (Meteor.Users.findOne {"user.userId": id, "user.role": "MODERATOR"})?

  # using handlebars' {{equals}} wasn't working for these some reason, so heres a simple JS function to do it
  compareUserIds: (u1, u2) ->
    u1 is u2

Template.userItem.events
  "click .raiseHand": (event) ->
    Meteor.Users.update {_id: @_id},{ $set:{ "user.handRaised": true}}

  "click .disableCam": (event) ->
    Meteor.Users.update {_id: @_id}, {$set:{ "user.sharingVideo": false}}

  "click .disableMic": (event) ->
    Meteor.Users.update { _id: @_id},{ $set:{"user.sharingAudio": false}}

  "click .enableMic": (event) ->
    Meteor.Users.update {_id: @_id}, {$set:{"user.sharingAudio": true}}

  "click .enableCam": (event) ->
    Meteor.Users.update {_id: @_id}, {$set:{ "user.sharingVideo": true}}

  "click .lowerHand": (event) ->
    Meteor.Users.update {_id: @_id}, {$set:{ "user.handRaised": false}}

  "click .setPresenter": (event) ->
	   #
	   # Not the best way to go about doing this
	   # The meeting should probably know about the presenter instead of the individual user
     #

    # only perform operation if user is not already presenter, prevent extra DB work
    unless @isPresenter
      # from new user, find meeting
      theUser = Meteor.Users.findOne(_id:@_id)
      m = Meetings.findOne(meetingName: theUser.meetingId)
      # unset old user as presenter
      if m?
        u = Meteor.Users.findOne(
          meetingId: m.meetingName
          "user.presenter": true
        )
        if u?
          Meteor.Users.update {_id: u._id},{ $set:{ "user.presenter": false}}
          # set newly selected user as presenter
          Meteor.Users.update {_id: @_id},{$set:{"user.presenter": true}}

  "click .kickUser": (event) ->
  	#
    # Add:
    # When user is blown away, if they were presenter remove that from meeting (if kicking the presenter is even possible?)
    #		
    user = Meteor.Users.findOne(_id:@_id)
    meeting = Meetings.findOne(meetingName:user.meetingId)

    if user? and meeting?
      # find users index. I couldn't get indexOf() working
      index = -1
      i = 0

      while i < meeting.users.length
        if meeting.users[i].userId is user.user.externUserId
          index = i
          break
        i++
      if index >= 0
        meeting.users.splice index, 1 # remove user from meeting
        Meetings.update # update meeting
          _id: meeting._id
        ,
          $set:
            users: meeting.users

        Meteor.Users.update # remove meeting from user
          _id: @_id
        ,
          $set:
            meetingId: null

Template.displayOtherUsersControls.events
  "click .disableMic": (event) ->
    event.stopImmediatePropagation()
    u = Meteor.Users.findOne {"user.externUserId": event.currentTarget.id}
    Meteor.Users.update {_id: u._id}, {$set: {"user.sharingAudio": false}}
  "click .enableMic": (event) ->
    event.stopImmediatePropagation()
    u = Meteor.Users.findOne {"user.externUserId": event.currentTarget.id}
    Meteor.Users.update {_id: u._id}, {$set: {"user.sharingAudio": true}}
  "click .disableCam": (event) ->
    event.stopImmediatePropagation()
    u = Meteor.Users.findOne {"user.externUserId": event.currentTarget.id}
    Meteor.Users.update {_id: u._id}, {$set: {"user.sharingVideo": false}}
  "click .enableCam": (event) ->
    event.stopImmediatePropagation()
    u = Meteor.Users.findOne {"user.externUserId": event.currentTarget.id}
    Meteor.Users.update {_id: u._id}, {$set: {"user.sharingVideo": true}}

Template.displayOwnControls.events
  "click .disableMic": (event) ->
    event.stopImmediatePropagation()
    u = Meteor.Users.findOne {"user.externUserId": event.currentTarget.id}
    Meteor.Users.update {_id: u._id}, {$set: {"user.sharingAudio": false}}
  "click .enableMic": (event) ->
    event.stopImmediatePropagation()
    u = Meteor.Users.findOne {"user.externUserId": event.currentTarget.id}
    Meteor.Users.update {_id: u._id}, {$set: {"user.sharingAudio": true}}
  "click .disableCam": (event) ->
    event.stopImmediatePropagation()
    u = Meteor.Users.findOne {"user.externUserId": event.currentTarget.id}
    Meteor.Users.update {_id: u._id}, {$set: {"user.sharingVideo": false}}
  "click .enableCam": (event) ->
    event.stopImmediatePropagation()
    u = Meteor.Users.findOne {"user.externUserId": event.currentTarget.id}
    Meteor.Users.update {_id: u._id}, {$set: {"user.sharingVideo": true}}