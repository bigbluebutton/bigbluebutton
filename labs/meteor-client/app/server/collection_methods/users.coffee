# --------------------------------------------------------------------------------------------
# Public methods on server
# All these method must first authenticate the user before it calls the private function counterpart below
# which sends the request to bbbApps. If the method is modifying the media the current user is sharing,
# you should perform the request before sending the request to bbbApps. This allows the user request to be performed
# immediately, since they do not require permission for things such as muting themsevles. 
# --------------------------------------------------------------------------------------------
Meteor.methods
  userShareAudio: (meetingId, userId, user_id) ->
    updateVoiceUser {'user_id': user_id, 'talking':false, 'joined': true, 'muted':false}
    #TODO we need to send a message to bbb-apps about it

  userStopAudio: (meetingId, userId, user_id, requesterUserId, requester_id) ->
    user = Meteor.Users.findOne({'meetingId': meetingId, 'userId': userId, '_id': user_id})
    requester = Meteor.Users.findOne({'meetingId': meetingId, 'userId': requesterUserId, '_id': requester_id})
    if user? and requester? and ((user._id is requester._id) or requester.presenter)
      message =
        "payload":
          "userid": user.userId
          "meeting_id": user.meetingId
        "header":
          "timestamp": new Date().getTime()
          "name": "user_left_voice_request"
          "version": "0.0.1"

      publish Meteor.config.redis.channels.toBBBApps.voice, message
      updateVoiceUser meetingId, {'user_id': user_id, talking:false, joined: false, muted:false}
    else
      Meteor.log.info "did not have enough information to send a mute_user_request"

  # Verifies muter exists, provided proper credentials, and has permission to mute the user
  publishMuteRequest: (meetingId, mutee_id, requesterUserId, requester_id, mutedBoolean) ->
    Meteor.log.info "publishing a user mute #{mutedBoolean} request for #{mutee_id}"
    mutee = Meteor.Users.findOne({'meetingId': meetingId, _id: mutee_id})
    muter = Meteor.Users.findOne({'meetingId': meetingId, 'userId': requesterUserId, _id: requester_id})
    if mutee? and muter?
      message =
        "payload":
          "userid": mutee.userId
          "meeting_id": meetingId
          "mute": mutedBoolean
          "requester_id": muter.userId
        "header":
          "timestamp": new Date().getTime()
          "name": "mute_user_request"
          "version": "0.0.1"

      publish Meteor.config.redis.channels.toBBBApps.voice, message
      updateVoiceUser meetingId, {'user_id': mutee._id, talking:false, muted:mutedBoolean}
      # 
    else
      Meteor.log.info "did not have enough information to send a mute_user_request"

  # meetingId: the meetingId which both users are in 
  # toLowerUserId: the userid of the user to have their hand lowered
  # loweredByUserId: userId of person lowering
  # loweredBySecret: the secret of the requestor
  userLowerHand: (meetingId, toLowerUserId, loweredByUserId, loweredBySecret) ->
    action = ->
      if toLowerUserId is loweredByUserId
        return 'lowerOwnHand'
      else
        return 'lowerOthersHand'

    if isAllowedTo(action(), meetingId, loweredByUserId, loweredBySecret)
      message =
        payload:
          userid: toLowerUserId
          meeting_id: meetingId
          raise_hand: false
          lowered_by: loweredByUserId
        header:
          timestamp: new Date().getTime()
          name: "user_lowered_hand_message"
          version: "0.0.1"

      # publish to pubsub
      publish Meteor.config.redis.channels.toBBBApps.users, message
    return

  # meetingId: the meetingId which both users are in 
  # toRaiseUserId: the userid of the user to have their hand lowered
  # raisedByUserId: userId of person lowering
  # raisedBySecret: the secret of the requestor
  userRaiseHand: (meetingId, toRaiseUserId, raisedByUserId, raisedBySecret) ->
    action = ->
      if toRaiseUserId is raisedByUserId
        return 'raiseOwnHand'
      else
        return 'raiseOthersHand'

    if isAllowedTo(action(), meetingId, raisedByUserId, raisedBySecret)
      message =
        payload:
          userid: toRaiseUserId
          meeting_id: meetingId
          raise_hand: false
          lowered_by: raisedByUserId
        header:
          timestamp: new Date().getTime()
          name: "user_raised_hand_message"
          version: "0.0.1"

      # publish to pubsub
      publish Meteor.config.redis.channels.toBBBApps.users, message
    return

  userLogout: (meetingId, userId) ->
    Meteor.log.info "a user is logging out from #{meetingId}:" + userId
    u = Meteor.Users.findOne({meetingId: meetingId, userId: userId})
    if u?
      #remove from the collection and dispatch a message to redis
      requestUserLeaving meetingId, u.userId, u._id

# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------

# Only callable from server
# Received information from BBB-Apps that a user left
# Need to update the collection
# params: meetingid, userid as defined in BBB-Apps
@removeUserFromMeeting = (meetingId, userId) ->
  u = Meteor.Users.findOne({'meetingId': meetingId, 'userId': userId})
  if u?
    Meteor.Users.remove(u._id)
    Meteor.log.info "----removed user[" + userId + "] from " + meetingId
  else
    Meteor.log.info "did not find a user [userId] to delete in meetingid:#{meetingId}"

# Corresponds to a valid action on the HTML clientside
# After authorization, publish a user_leaving_request in redis
# params: meetingid, userid as defined in BBB-Apps, the _id user identifier in mongo
@requestUserLeaving = (meetingId, userId, user_id) ->
  u = Meteor.Users.findOne({'meetingId': meetingId, 'userId': userId, _id: user_id})
  if u?
    message =
      "payload":
        "meeting_id": meetingId
        "userid": u.userId
      "header":
        "timestamp": new Date().getTime()
        "name": "user_leaving_request"
        "version": "0.0.1"
    Meteor.log.info "sending a user_leaving_request for #{meetingId}:#{u._id}"

    if u.userId? and meetingId?
      publish Meteor.config.redis.channels.toBBBApps.users, message
    else
      Meteor.log.info "did not have enough information to send a user_leaving_request"

#update a voiceUser - a helper method
@updateVoiceUser = (meetingId, voiceUserObject) ->
  u = Meteor.Users.findOne userId: voiceUserObject.web_userid
  if u?
    if voiceUserObject.talking?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid}, {$set: {'user.voiceUser.talking':voiceUserObject.talking}}, {multi: false}) # talking
    if voiceUserObject.joined?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid}, {$set: {'user.voiceUser.joined':voiceUserObject.joined}}, {multi: false}) # joined
    if voiceUserObject.locked?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid}, {$set: {'user.voiceUser.locked':voiceUserObject.locked}}, {multi: false}) # locked
    if voiceUserObject.muted?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid}, {$set: {'user.voiceUser.muted':voiceUserObject.muted}}, {multi: false}) # muted
    if voiceUserObject.listenOnly?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid}, {$set: {'user.listenOnly':voiceUserObject.listenOnly}}, {multi: false}) # muted
  else
    Meteor.log.info "ERROR! did not find such voiceUser!"

@addUserToCollection = (meetingId, user) ->
  userId = user.userid
  #check if the user is already in the meeting
  unless Meteor.Users.findOne({userId:userId, meetingId: meetingId})?
    entry =
      meetingId: meetingId
      userId: userId
      userSecret: Math.random().toString(36).substring(2,13)
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
        connection_status: "" # TODO consider other default value
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
    Meteor.log.info "added user userSecret=#{entry.userSecret} id=[#{id}]:#{user.name}. Users.size is now #{Meteor.Users.find({meetingId: meetingId}).count()}"
