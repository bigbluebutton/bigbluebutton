Meteor.methods
  ###
  authenticate: (auth) ->
    throw new Meteor.Error(422, "You need a token to authenticate.")  unless auth.token
    throw new Meteor.Error(422, "You need a userId to authenticate.")  unless auth.userId
    throw new Meteor.Error(422, "You need a meetingId to authenticate.")  unless auth.meetingId
    user =
      userId: "user1"
      meetingId: "demo123"

    #UserSession.set(meetingId + ":" userId, user);
    userId = Meteor.Users.insert(user)
    console.log "User id=[" + userId + "]"
    @setUserId userId
    console.log @userId
    userId
  ###

  #showUserId: ->
  #  throw new Meteor.Error(422, @userId)return

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

  userShareAudio: (meetingId, userId) ->
    if meetingId? and userId? 
      Meteor.Users.update({meetingId: meetingId, userId: userId}, {$set:{'user.voiceUser.joined':true}})

  userStopAudio: (meetingId, userId) ->
    if meetingId? and userId? 
      Meteor.Users.update({meetingId: meetingId, userId: userId}, {$set:{'user.voiceUser.talking':false}})
      Meteor.Users.update({meetingId: meetingId, userId: userId}, {$set:{'user.voiceUser.joined':false}})

  userRaiseHand: (userId) ->
    if userId?
      Meteor.Users.update({userId:userId}, {$set: {'user.raise_hand':true}})

  userLowerHand: (userId) ->
    if userId?
      Meteor.Users.update({userId:userId}, {$set: {'user.raise_hand':false}})
