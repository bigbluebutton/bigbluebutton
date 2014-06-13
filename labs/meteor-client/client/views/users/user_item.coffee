Template.userItem.helpers
  domain: ->
    a = document.createElement("a")
    a.href = @url
    a.hostname

  isUserModerator: =>
    id = Session.get("userId") or "a1a1a1a1a1a1"
    (Meteor.users.findOne {"user.userId": id, "user.role": "MODERATOR"})?

  # using handlebars' {{equals}} wasn't working for these some reason, so heres a simple JS function to do it
  compareUserIds: (u1, u2) ->
    u1 is u2

Template.userItem.events
  "click .raiseHand": (event) ->
    Meteor.users.update
      _id: @_id
    ,
      $set:
        "user.handRaised": true

  "click .disableCam": (event) ->
    Meteor.users.update
      _id: @_id
    ,
      $set:
        "user.sharingVideo": false

  "click .disableMic": (event) ->
    Meteor.users.update
      _id: @_id
    ,
      $set:
        "user.sharingAudio": false

  "click .enableMic": (event) ->
    Meteor.users.update
      _id: @_id
    ,
      $set:
        "user.sharingAudio": true

  "click .enableCam": (event) ->
    Meteor.users.update
      _id: @_id
    ,
      $set:
        "user.sharingVideo": true

  "click .lowerHand": (event) ->
    Meteor.users.update
      _id: @_id
    ,
      $set:
        "user.handRaised": false

  "click .setPresenter": (event) ->
	   #
	   # Not the best way to go about doing this
	   # The meeting should probably know about the presenter instead of the individual user
     #

    # only perform operation if user is not already presenter, prevent extra DB work
    unless @user.presenter
      # from new user, find meeting
      m = Meetings.findOne(meetingName: @meetingId)
      # unset old user as presenter
      if m?
        u = Meteor.users.findOne(
          meetingId: m.meetingName
          "user.presenter": true
        )
        if u?
          Meteor.users.update
            _id: u._id
          ,
            $set:
              "user.presenter": false

      # set newly selected user as presenter
      Meteor.users.update
        _id: @_id
      ,
        $set:
          "user.presenter": true

  "click .kickUser": (event) ->
  	#
    # Add:
    # When user is blown away, if they were presenter remove that from meeting (if kicking the presenter is even possible?)
    #		
    user = @
    meeting = Meetings.findOne(meetingName: @meetingId)
    if user? and meeting?
      # find users index. I couldn't get indexOf() working because the array is of objects
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

        Meteor.users.update # remove meeting from user
          _id: @_id
        ,
          $set:
            meetingId: null