# --------------------------------------------------------------------------------------------
# Public methods on server
# All these method must first authenticate the user before it calls the private function counterpart below
# which sends the request to bbbApps. If the method is modifying the media the current user is sharing,
# you should perform the request before sending the request to bbbApps. This allows the user request to be performed
# immediately, since they do not require permission for things such as muting themsevles. 
# --------------------------------------------------------------------------------------------
Meteor.methods
  # meetingId: the meetingId of the meeting the user[s] is in
  # toMuteUserId: the userId of the user to be [un]muted
  # requesterUserId: the userId of the requester
  # requesterToken: the authToken of the requester
  # mutedBoolean: true for muting, false for unmuting
  muteUser: (meetingId, toMuteUserId, requesterUserId, requesterToken, mutedBoolean) ->
    action = ->
      if mutedBoolean
        if toMuteUserId is requesterUserId
          return 'muteSelf'
        else
          return 'muteOther'
      else
        if toMuteUserId is requesterUserId
          return 'unmuteSelf'
        else
          return 'unmuteOther'

    if isAllowedTo(action(), meetingId, requesterUserId, requesterToken)
      message =
        payload:
          userid: toMuteUserId
          meeting_id: meetingId
          mute: mutedBoolean
          requester_id: requesterUserId
        header:
          timestamp: new Date().getTime()
          name: "mute_user_request"
          version: "0.0.1"

      Meteor.log.info "publishing a user mute #{mutedBoolean} request for #{toMuteUserId}"

      publish Meteor.config.redis.channels.toBBBApps.voice, message
      updateVoiceUser meetingId, {'web_userid': toMuteUserId, talking:false, muted:mutedBoolean}
    return

  # meetingId: the meetingId which both users are in 
  # toLowerUserId: the userid of the user to have their hand lowered
  # loweredByUserId: userId of person lowering
  # loweredByToken: the authToken of the requestor
  userLowerHand: (meetingId, toLowerUserId, loweredByUserId, loweredByToken) ->
    action = ->
      if toLowerUserId is loweredByUserId
        return 'lowerOwnHand'
      else
        return 'lowerOthersHand'

    if isAllowedTo(action(), meetingId, loweredByUserId, loweredByToken)
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
  # raisedByToken: the authToken of the requestor
  userRaiseHand: (meetingId, toRaiseUserId, raisedByUserId, raisedByToken) ->
    action = ->
      if toRaiseUserId is raisedByUserId
        return 'raiseOwnHand'
      else
        return 'raiseOthersHand'

    if isAllowedTo(action(), meetingId, raisedByUserId, raisedByToken)
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

  # meetingId: the meeting where the user is
  # userId: the userid of the user logging out
  # authToken: the authToken of the user
  userLogout: (meetingId, userId, authToken) ->
    if isAllowedTo('logoutSelf', meetingId, userId, authToken)
      Meteor.log.info "a user is logging out from #{meetingId}:" + userId
      requestUserLeaving meetingId, userId

# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------

# Only callable from server
# Received information from BBB-Apps that a user left
# Need to update the collection
# params: meetingid, userid as defined in BBB-Apps
@markUserOffline = (meetingId, userId) ->
  # mark the user as offline. remove from the collection on meeting_end #TODO
  Meteor.log.info "marking user [#{userId}] as offline in meeting[#{meetingId}]"
  Meteor.Users.update({'meetingId': meetingId, 'userId': userId}, {$set:{'user.connection_status':'offline'}})


# Corresponds to a valid action on the HTML clientside
# After authorization, publish a user_leaving_request in redis
# params: meetingid, userid as defined in BBB-App
@requestUserLeaving = (meetingId, userId) ->
  if Meteor.Users.findOne({'meetingId': meetingId, 'userId': userId})?
    message =
      payload:
        meeting_id: meetingId
        userid: userId
      header:
        timestamp: new Date().getTime()
        name: "user_leaving_request"
        version: "0.0.1"

    if userId? and meetingId?
      Meteor.log.info "sending a user_leaving_request for #{meetingId}:#{userId}"
      publish Meteor.config.redis.channels.toBBBApps.users, message
    else
      Meteor.log.info "did not have enough information to send a user_leaving_request"

#update a voiceUser - a helper method
@updateVoiceUser = (meetingId, voiceUserObject) ->
  u = Meteor.Users.findOne userId: voiceUserObject.web_userid
  if u?
    if voiceUserObject.talking?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid}, {$set: {'user.voiceUser.talking':voiceUserObject.talking}}) # talking
    if voiceUserObject.joined?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid}, {$set: {'user.voiceUser.joined':voiceUserObject.joined}}) # joined
    if voiceUserObject.locked?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid}, {$set: {'user.voiceUser.locked':voiceUserObject.locked}}) # locked
    if voiceUserObject.muted?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid}, {$set: {'user.voiceUser.muted':voiceUserObject.muted}}) # muted
    if voiceUserObject.listenOnly?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid}, {$set: {'user.listenOnly':voiceUserObject.listenOnly}}) # muted
  else
    Meteor.log.info "ERROR! did not find such voiceUser!"

@userJoined = (meetingId, user) ->
  userId = user.userid

  u = Meteor.Users.findOne({userId:user.userid, meetingId: meetingId})
  # the collection already contains an entry for this user because
  # we added a dummy user on register_user_message (to save authToken)
  if u?
    Meteor.log.info "UPDATING USER #{user.userid}, authToken=#{u.authToken}"
    Meteor.Users.update({userId:user.userid, meetingId: meetingId}, {$set:{
      user:
        userid: user.userid
        presenter: user.presenter
        name: user.name
        _sort_name: user.name.toLowerCase()
        phone_user: user.phone_user
        raise_hand: user.raise_hand
        has_stream: user.has_stream
        role: user.role
        listenOnly: user.listenOnly
        extern_userid: user.extern_userid
        permissions: user.permissions
        locked: user.locked
        time_of_joining: user.timeOfJoining
        connection_status: "online" # TODO consider other default value
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
      }})

    welcomeMessage = Meteor.config.defaultWelcomeMessage
    .replace /%%CONFNAME%%/, Meteor.Meetings.findOne({meetingId: meetingId})?.meetingName
    welcomeMessage = welcomeMessage + Meteor.config.defaultWelcomeMessageFooter

    # store the welcome message in chat for easy display on the client side
    chatId = Meteor.Chat.upsert({'message.chat_type':"SYSTEM_MESSAGE", 'message.to_userid': userId, meetingId: meetingId},
      {$set:{
        meetingId: meetingId
        'message.chat_type': "SYSTEM_MESSAGE"
        'message.message': welcomeMessage
        'message.from_color': '0x3399FF'
        'message.to_userid': userId
        'message.from_userid': "SYSTEM_MESSAGE"
        'message.from_username': ""
        'message.from_time': user.timeOfJoining.toString()
      }})
    Meteor.log.info "added a system message in chat for user #{userId}"

  else
    # scenario: there are meetings running at the time when the meteor
    # process starts. As a result we the get_users_reply message contains
    # users for which we have not observed user_registered_message and
    # hence we do not have the auth_token. There will be permission issues
    # as the server collection does not have the auth_token of such users
    # and cannot authorize their client side actions
    Meteor.log.info "NOTE: got user_joined_message "
    entry =
      meetingId: meetingId
      userId: userId
      user:
        userid: user.userid
        presenter: user.presenter
        name: user.name
        _sort_name: user.name.toLowerCase()
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
    Meteor.log.info "joining user id=[#{id}]:#{user.name}. Users.size is now #{Meteor.Users.find({meetingId: meetingId}).count()}"

@createDummyUser = (meetingId, user) ->
  if Meteor.Users.findOne({userId:user.userid, meetingId: meetingId})?
    Meteor.log.info "ERROR!! CAN'T REGISTER AN EXISTSING USER"
  else
    entry =
      meetingId: meetingId
      userId: user.userid
      authToken: user.authToken

    id = Meteor.Users.insert(entry)
    Meteor.log.info "added user dummy user id=[#{id}]:#{user.name}.
      Users.size is now #{Meteor.Users.find({meetingId: meetingId}).count()}"

# called on server start and on meeting end
@clearUsersCollection = (meetingId) ->
  if meetingId?
    Meteor.Users.remove({meetingId: meetingId}, Meteor.log.info "cleared Users Collection (meetingId: #{meetingId}!")
  else
    Meteor.Users.remove({}, Meteor.log.info "cleared Users Collection (all meetings)!")
