# --------------------------------------------------------------------------------------------
# Public methods on server
# All these method must first authenticate the user before it calls the private function counterpart below
# which sends the request to bbbApps. If the method is modifying the media the current user is sharing,
# you should perform the request before sending the request to bbbApps. This allows the user request to be performed
# immediately, since they do not require permission for things such as muting themsevles.
# --------------------------------------------------------------------------------------------
Meteor.methods
  # meetingId: the meetingId of the meeting the user is in
  # toSetUserId: the userId of the user joining
  # requesterUserId: the userId of the requester
  # requesterToken: the authToken of the requester
  listenOnlyRequestToggle: (meetingId, userId, authToken, isJoining) ->
    voiceConf = Meteor.Meetings.findOne({meetingId:meetingId})?.voiceConf
    username = Meteor.Users.findOne({meetingId:meetingId, userId:userId})?.user.name
    if isJoining
      if isAllowedTo('joinListenOnly', meetingId, userId, authToken)
        message =
          payload:
            userid: userId
            meeting_id: meetingId
            voice_conf: voiceConf
            name: username
          header:
            timestamp: new Date().getTime()
            name: "user_connected_to_global_audio"
            version: "0.0.1"

        Meteor.log.info "publishing a user listenOnly toggleRequest #{isJoining} request for #{userId}"

        publish Meteor.config.redis.channels.toBBBApps.meeting, message

    else
      if isAllowedTo('leaveListenOnly', meetingId, userId, authToken)
        message =
          payload:
            userid: userId
            meeting_id: meetingId
            voice_conf: voiceConf
            name: username
          header:
            timestamp: new Date().getTime()
            name: "user_disconnected_from_global_audio"
            version: "0.0.1"

        Meteor.log.info "publishing a user listenOnly toggleRequest #{isJoining} request for #{userId}"

        publish Meteor.config.redis.channels.toBBBApps.meeting, message

    return

  # meetingId: the meetingId of the meeting the user[s] is in
  # toMuteUserId: the userId of the user to be muted
  # requesterUserId: the userId of the requester
  # requesterToken: the authToken of the requester
  muteUser: (meetingId, toMuteUserId, requesterUserId, requesterToken) ->
    action = ->
      if toMuteUserId is requesterUserId
        return 'muteSelf'
      else
        return 'muteOther'

    if isAllowedTo(action(), meetingId, requesterUserId, requesterToken)
      message =
        payload:
          user_id: toMuteUserId
          meeting_id: meetingId
          mute: true
          requester_id: requesterUserId
        header:
          timestamp: new Date().getTime()
          name: "mute_user_request_message"
          version: "0.0.1"

      Meteor.log.info "publishing a user mute request for #{toMuteUserId}"

      publish Meteor.config.redis.channels.toBBBApps.users, message
      updateVoiceUser meetingId, {'web_userid': toMuteUserId, talking:false, muted:true}
    return

  # meetingId: the meetingId of the meeting the user[s] is in
  # toMuteUserId: the userId of the user to be unmuted
  # requesterUserId: the userId of the requester
  # requesterToken: the authToken of the requester
  unmuteUser: (meetingId, toMuteUserId, requesterUserId, requesterToken) ->
    action = ->
      if toMuteUserId is requesterUserId
        return 'unmuteSelf'
      else
        return 'unmuteOther'

    if isAllowedTo(action(), meetingId, requesterUserId, requesterToken)
      message =
        payload:
          user_id: toMuteUserId
          meeting_id: meetingId
          mute: false
          requester_id: requesterUserId
        header:
          timestamp: new Date().getTime()
          name: "mute_user_request_message"
          version: "0.0.1"

      Meteor.log.info "publishing a user unmute request for #{toMuteUserId}"

      publish Meteor.config.redis.channels.toBBBApps.users, message
      updateVoiceUser meetingId, {'web_userid': toMuteUserId, talking:false, muted:false}
    return

  userSetEmoji: (meetingId, toRaiseUserId, raisedByUserId, raisedByToken, status) ->
    if isAllowedTo('setEmojiStatus', meetingId, raisedByUserId, raisedByToken)
      message =
        payload:
          emoji_status: status
          userid: toRaiseUserId
          meeting_id: meetingId
        header:
          timestamp: new Date().getTime()
          name: "user_emoji_status_message"
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
  user = Meteor.Users.findOne({meetingId: meetingId, userId: userId})
  if user?.clientType is "HTML5"
    Meteor.Users.update({meetingId: meetingId, userId: userId}, {$set:{
    'user.connection_status':'offline'
    'voiceUser.talking': false
    'voiceUser.joined': false
    'voiceUser.muted': false
    'user.time_of_joining': 0
    'user.listenOnly': false
    }})
  else
    Meteor.log.error "deleting info for user #{user?.user.name} #{userId}"
    Meteor.Users.remove({meetingId: meetingId, userId: userId})


# Corresponds to a valid action on the HTML clientside
# After authorization, publish a user_leaving_request in redis
# params: meetingid, userid as defined in BBB-App
@requestUserLeaving = (meetingId, userId) ->
  userObject = Meteor.Users.findOne({'meetingId': meetingId, 'userId': userId})
  voiceConf = Meteor.Meetings.findOne({meetingId:meetingId})?.voiceConf
  if userObject? and voiceConf? and userId? and meetingId?

    # end listenOnly audio for the departing user
    if userObject.user.listenOnly
      listenOnlyMessage =
        payload:
          userid: userId
          meeting_id: meetingId
          voice_conf: voiceConf
          name: userObject.user.name
        header:
          timestamp: new Date().getTime()
          name: "user_disconnected_from_global_audio"

      publish Meteor.config.redis.channels.toBBBApps.meeting, listenOnlyMessage

    # remove user from meeting
    message =
      payload:
        meeting_id: meetingId
        userid: userId
      header:
        timestamp: new Date().getTime()
        name: "user_leaving_request"

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
    if voiceUserObject.listen_only?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid}, {$set: {'user.listenOnly':voiceUserObject.listen_only}}) # listenOnly
  else
    Meteor.log.error "ERROR! did not find such voiceUser!"

@userJoined = (meetingId, user) ->
  userId = user.userid

  u = Meteor.Users.findOne({userId:user.userid, meetingId: meetingId})
  # the collection already contains an entry for this user because
  # we added a dummy user on register_user_message (to save authToken)
  if u? and u.authToken?
    Meteor.log.info "(case1) UPDATING USER #{user.userid}, authToken=#{u.authToken}, locked=#{user.locked}, username=#{user.name}"
    Meteor.Users.update({userId:user.userid, meetingId: meetingId}, {$set:{
      user:
        userid: user.userid
        presenter: user.presenter
        name: user.name
        _sort_name: user.name.toLowerCase()
        phone_user: user.phone_user
        emoji_status: user.emoji_status
        set_emoji_time: user.set_emoji_time
        emoji_status: user.emoji_status
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

    # only add the welcome message if it's not there already
    unless Meteor.Chat.findOne({"message.chat_type":'SYSTEM_MESSAGE', "message.to_userid": userId})?
      welcomeMessage = Meteor.config.defaultWelcomeMessage
      .replace /%%CONFNAME%%/, Meteor.Meetings.findOne({meetingId: meetingId})?.meetingName
      welcomeMessage = welcomeMessage + Meteor.config.defaultWelcomeMessageFooter

      # store the welcome message in chat for easy display on the client side
      Meteor.Chat.insert(
        meetingId: meetingId
        message:
          chat_type: "SYSTEM_MESSAGE"
          message: welcomeMessage
          from_color: '0x3399FF'
          to_userid: userId
          from_userid: "SYSTEM_MESSAGE"
          from_username: ""
          from_time: user.timeOfJoining?.toString()
        )
      Meteor.log.info "added a system message in chat for user #{userId}"

  else
    Meteor.log.info "NOTE: got user_joined_message #{user.name} #{user.userid}"

    obj = Meteor.Users.upsert({meetingId: meetingId, userId: userId}, {
      meetingId: meetingId
      userId: userId
      user:
        userid: user.userid
        presenter: user.presenter
        name: user.name
        _sort_name: user.name.toLowerCase()
        phone_user: user.phone_user
        emoji_status: user.emoji_status
        set_emoji_time: user.set_emoji_time
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
      }, (err, numChanged) ->
        if numChanged.insertedId?
          Meteor.log.info "joining user (case2) userid=[#{userId}], id=[#{obj}]:#{user.name}.
            Users.size is now #{Meteor.Users.find({meetingId: meetingId}).count()}")



@createDummyUser = (meetingId, userId, authToken) ->
  if Meteor.Users.findOne({userId:userId, meetingId: meetingId, authToken:authToken})?
    Meteor.log.info "html5 user userid:[#{userId}] from [#{meetingId}] tried to revalidate token"
  else
    entry =
      meetingId: meetingId
      userId: userId
      authToken: authToken
      clientType: "HTML5"
      validated: false #will be validated on validate_auth_token_reply

    id = Meteor.Users.insert(entry)
    Meteor.log.info "added user dummy html5 user with: userid=[#{userId}], id=[#{id}]
      Users.size is now #{Meteor.Users.find({meetingId: meetingId}).count()}"


# when new lock settings including disableMic are set,
# all viewers that are in the audio bridge with a mic should be muted and locked
@handleLockingMic = (meetingId, newSettings) ->
  # send mute requests for the viewer users joined with mic
  for u in Meteor.Users.find({
        meetingId:meetingId
        'user.role':'VIEWER'
        'user.listenOnly':false
        'user.locked':true
        'user.voiceUser.joined':true
        'user.voiceUser.muted':false})?.fetch()
    # Meteor.log.info u.user.name #
    Meteor.call('muteUser', meetingId, u.userId, u.userId, u.authToken, true) #true for muted

# change the locked status of a user (lock settings)
@setUserLockedStatus = (meetingId, userId, isLocked) ->
  if Meteor.Users.findOne({userId:userId, meetingId: meetingId})?
    Meteor.Users.update({userId:userId, meetingId: meetingId}, {$set:{'user.locked': isLocked}})

    # if the user is sharing audio, he should be muted upon locking involving disableMic
    u = Meteor.Users.findOne({meetingId:meetingId, userId:userId})
    if u.user.role is 'VIEWER' and !u.user.listenOnly and u.user.voiceUser.joined and !u.user.voiceUser.muted and isLocked
      Meteor.call('muteUser', meetingId, u.userId, u.userId, u.authToken, true) #true for muted

    Meteor.log.info "setting user locked status for userid:[#{userId}] from [#{meetingId}] locked=#{isLocked}"
  else
    Meteor.log.error "(unsuccessful-no such user) setting user locked status for userid:[#{userId}] from [#{meetingId}] locked=#{isLocked}"


# called on server start and on meeting end
@clearUsersCollection = (meetingId) ->
  if meetingId?
    Meteor.Users.remove({meetingId: meetingId}, Meteor.log.info "cleared Users Collection (meetingId: #{meetingId}!")
  else
    Meteor.Users.remove({}, Meteor.log.info "cleared Users Collection (all meetings)!")
