Meteor.methods
  addUserToCollection: (meetingId, user) ->
    userId = user.userid
    #check if the user is already in the meeting
    unless Meteor.Users.findOne({userId:userId, meetingId: meetingId})?
      entry =
        meetingId: meetingId
        userId: userId
        user:
          userid: user.userid
          presenter: user.presenter
          name: user.name
          phone_user: user.phone_user
          raise_hand: user.raise_hand
          has_stream: user.has_stream
          role: user.role
          listenOnly: user.listenOnly
          extern_userid: user.extern_userid
          permissions: user.permissions
          locked: user.locked
          time_of_joining: user.timeOfJoining
          voiceUser:
            web_userid: user.voiceUser.web_userid
            callernum: user.voiceUser.callernum
            userid: user.voiceUser.userid
            talking: user.voiceUser.talking
            joined: user.voiceUser.joined
            callername: user.voiceUser.callername
            locked: user.voiceUser.locked
            muted: user.voiceUser.muted
          webcam_stream: user.webcam_stream

      id = Meteor.Users.insert(entry)
      console.log "added user id=[#{id}]:#{user.name}. Users.size is now #{Meteor.Users.find({meetingId: meetingId}).count()}"

  removeUserFromCollection: (meetingId, userId) ->
    if meetingId? and userId? and Meteor.Users.findOne({meetingId: meetingId, userId: userId})?
      id = Meteor.Users.findOne({meetingId: meetingId, userId: userId})
      if id?
        Meteor.Users.remove(id._id)
        console.log "----removed user[" + userId + "] from " + meetingId

  #
  # Voice
  userShareAudio: (meetingId, userId) ->
    if meetingId? and userId?
      Meteor.call('updateVoiceUser',meetingId, {web_userid: userId, talking:false, joined: true, muted:false})
      #TODO should we also send a message to bbb-apps about it?

  userStopAudio: (meetingId, userId) ->
    console.log "publishing a user left voice request for #{userId} in #{meetingId}"
    message =
      "payload":
        "userid": userId
        "meeting_id": meetingId
      "header":
        "timestamp": new Date().getTime()
        "name": "user_left_voice_request"
        "version": "0.0.1"

    if meetingId? and userId?
      Meteor.redisPubSub.publish(Meteor.config.redis.channels.toBBBApps.voice, message)
      Meteor.call('updateVoiceUser',meetingId, {web_userid: userId, talking:false, joined: false, muted:false})
    else
      console.log "did not have enough information to send a mute_user_request"

  #update a voiceUser - a helper method
  updateVoiceUser: (meetingId, voiceUserObject) ->
    console.log "I am updating the voiceUserObject with the following: " + JSON.stringify voiceUserObject
    u = Meteor.Users.findOne({userId: voiceUserObject?.web_userid, meetingId: meetingId})
    if u?
      if voiceUserObject?.talking?
        Meteor.Users.update({_id:u._id}, {$set: {'user.voiceUser.talking':voiceUserObject?.talking}})# talking
      if voiceUserObject?.joined?
        Meteor.Users.update({_id:u._id}, {$set: {'user.voiceUser.joined':voiceUserObject?.joined}})# joined
      if voiceUserObject?.locked?
        Meteor.Users.update({_id:u._id}, {$set: {'user.voiceUser.locked':voiceUserObject?.locked}})# locked
      if voiceUserObject?.muted?
        Meteor.Users.update({_id:u._id}, {$set: {'user.voiceUser.muted':voiceUserObject?.muted}})# muted
    else
      console.log "ERROR! did not find such voiceUser!"

  publishMuteRequest: (meetingId, userId, requesterId, mutedBoolean) ->
    console.log "publishing a user mute #{mutedBoolean} request for #{userId}"
    message =
      "payload":
        "userid": userId
        "meeting_id": meetingId
        "mute": mutedBoolean
        "requester_id": requesterId
      "header": 
        "timestamp": new Date().getTime()
        "name": "mute_user_request"
        "version": "0.0.1"

    if meetingId? and userId? and requesterId?
      Meteor.redisPubSub.publish(Meteor.config.redis.channels.toBBBApps.voice, message)
      # modify the collection
      Meteor.Users.update({userId:userId, meetingId: meetingId}, {$set:{'user.voiceUser.talking':false}})
      numChanged = Meteor.Users.update({userId:userId, meetingId: meetingId}, {$set:{'user.voiceUser.muted':mutedBoolean}})
      if numChanged isnt 1
        console.log "\n\nSomething went wrong!! We were supposed to mute/unmute 1 user!!\n\n"
    else
      console.log "did not have enough information to send a mute_user_request"

  # Raise & Lower hand
  userLowerHand: (meetingId, userId, loweredBy) ->
    console.log "publishing a userLowerHand event: #{userId}--by=#{loweredBy}"

    if meetingId? and userId? and loweredBy?
      message =
        "payload":
          "userid": userId
          "meeting_id": meetingId
          "raise_hand": false
          "lowered_by": loweredBy
        "header":
          "timestamp": new Date().getTime()
          "name": "user_lowered_hand_message"
          "version": "0.0.1"

      #publish to pubsub
      Meteor.redisPubSub.publish(Meteor.config.redis.channels.toBBBApps.users, message)
      #update Users collection
      Meteor.Users.update({userId:userId, meetingId: meetingId}, {$set: {'user.raise_hand': false}})

  userRaiseHand: (meetingId, userId) ->
    console.log "publishing a userRaiseHand event: #{userId}"

    if meetingId? and userId?
      message =
        "payload":
          "userid": userId
          "meeting_id": meetingId
          "raise_hand": true
        "header":
          "timestamp": new Date().getTime()
          "name": "user_raised_hand_message"
          "version": "0.0.1"

      #publish to pubsub
      Meteor.redisPubSub.publish(Meteor.config.redis.channels.toBBBApps.users, message)
      #update Users collection
      Meteor.Users.update({userId:userId, meetingId: meetingId}, {$set: {'user.raise_hand': true}})

  userLogout: (meetingId, userId) ->
    console.log "a user is logging out:" + userId
    #remove from the collection
    Meteor.call("removeUserFromCollection", meetingId, userId)
    #dispatch a message to redis
    Meteor.call('sendUserLeavingRequest', meetingId, userId)

  userKick: (meetingId, userId) ->
    console.log "#{userId} is being kicked"
    console.log "a user is logging out:" + userId
    #remove from the collection
    Meteor.call("removeUserFromCollection", meetingId, userId)
    #dispatch a message to redis
    Meteor.call('sendUserLeavingRequest', meetingId, userId)

