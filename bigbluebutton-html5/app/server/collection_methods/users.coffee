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

  #meetingId: the meeting where the user is
  #toKickUserId: the userid of the user to kick
  #requesterUserId: the userid of the user that wants to kick
  #authToken: the authToken of the user that wants to kick
  kickUser: (meetingId, toKickUserId, requesterUserId, authToken) ->
    if isAllowedTo('kickUser', meetingId, requesterUserId, authToken)
      message =
        "payload":
          "userid": toKickUserId
          "ejected_by": requesterUserId
          "meeting_id": meetingId
        "header":
          "name": "eject_user_from_meeting_request_message"

      publish Meteor.config.redis.channels.toBBBApps.users, message

  #meetingId: the meeting where the user is
  #newPresenterId: the userid of the new presenter
  #requesterSetPresenter: the userid of the user that wants to change the presenter
  #newPresenterName: user name of the new presenter
  #authToken: the authToken of the user that wants to kick
  setUserPresenter: (meetingId, newPresenterId, requesterSetPresenter, newPresenterName, authToken) ->
    if isAllowedTo('setPresenter', meetingId, requesterSetPresenter, authToken)
      message =
        "payload":
          "new_presenter_id": newPresenterId
          "new_presenter_name": newPresenterName
          "meeting_id": meetingId
          "assigned_by": requesterSetPresenter
        "header":
          "name": "assign_presenter_request_message"

    publish Meteor.config.redis.channels.toBBBApps.users, message


# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------

# Only callable from server
# Received information from BBB-Apps that a user left
# Need to update the collection
# params: meetingid, userid as defined in BBB-Apps
# callback
@markUserOffline = (meetingId, userId, callback) ->
  # mark the user as offline. remove from the collection on meeting_end #TODO
  user = Meteor.Users.findOne({meetingId: meetingId, userId: userId})
  if user?.clientType is "HTML5"
    Meteor.log.info "marking html5 user [#{userId}] as offline in meeting[#{meetingId}]"
    Meteor.Users.update({meetingId: meetingId, userId: userId}, {$set:{
    'user.connection_status':'offline'
    'voiceUser.talking': false
    'voiceUser.joined': false
    'voiceUser.muted': false
    'user.time_of_joining': 0
    'user.listenOnly': false
    }}, (err, numChanged) ->
      if err?
        Meteor.log.error "_unsucc update (mark as offline) of user #{user?.user.name} #{userId}
          err=#{JSON.stringify err}"
        callback()
      else
        funct = (cbk) ->
          Meteor.log.info "_marking as offline html5 user #{user?.user.name}
           #{userId}  numChanged=#{numChanged}"
          cbk()

        funct(callback)
    )
  else
    Meteor.Users.remove({meetingId: meetingId, userId: userId}, (err, numDeletions) ->
      if err?
        Meteor.log.error "_unsucc deletion of user #{user?.user.name} #{userId}
          err=#{JSON.stringify err}"
        callback()
      else
        funct = (cbk) ->
          Meteor.log.info "_deleting info for user #{user?.user.name} #{userId}
            numDeletions=#{numDeletions}"
          cbk()

        funct(callback)
    )


# Corresponds to a valid action on the HTML clientside
# After authorization, publish a user_leaving_request in redis
# params: meetingid, userid as defined in BBB-App
@requestUserLeaving = (meetingId, userId) ->
  userObject = Meteor.Users.findOne({'meetingId': meetingId, 'userId': userId})
  voiceConf = Meteor.Meetings.findOne({meetingId:meetingId})?.voiceConf
  if userObject?.user? and voiceConf? and userId? and meetingId?

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
@updateVoiceUser = (meetingId, voiceUserObject, callback) ->
  u = Meteor.Users.findOne userId: voiceUserObject.web_userid
  if u?
    if voiceUserObject.talking?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid},
       {$set: {'user.voiceUser.talking':voiceUserObject.talking}},
       (err, numChanged) ->
        if err?
          Meteor.log.error "_unsucc update of voiceUser #{voiceUserObject.web_userid}
           [talking] err=#{JSON.stringify err}"
        callback()
      ) # talking
    if voiceUserObject.joined?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid},
       {$set: {'user.voiceUser.joined':voiceUserObject.joined}},
       (err, numChanged) ->
        if err?
          Meteor.log.error "_unsucc update of voiceUser #{voiceUserObject.web_userid}
           [joined] err=#{JSON.stringify err}"
        callback()
      ) # joined
    if voiceUserObject.locked?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid},
       {$set: {'user.voiceUser.locked':voiceUserObject.locked}},
       (err, numChanged) ->
        if err?
          Meteor.log.error "_unsucc update of voiceUser #{voiceUserObject.web_userid}
           [locked] err=#{JSON.stringify err}"
        callback()
      ) # locked
    if voiceUserObject.muted?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid},
       {$set: {'user.voiceUser.muted':voiceUserObject.muted}},
       (err, numChanged) ->
        if err?
          Meteor.log.error "_unsucc update of voiceUser #{voiceUserObject.web_userid}
           [muted] err=#{JSON.stringify err}"
        callback()
      ) # muted
    if voiceUserObject.listen_only?
      Meteor.Users.update({meetingId: meetingId ,userId: voiceUserObject.web_userid},
       {$set: {'user.listenOnly':voiceUserObject.listen_only}},
       (err, numChanged) ->
        if err?
          Meteor.log.error "_unsucc update of voiceUser #{voiceUserObject.web_userid}
           [listenOnly] err=#{JSON.stringify err}"
        callback()
      ) # listenOnly
  else
    Meteor.log.error "ERROR! did not find such voiceUser!"
    callback()

@userJoined = (meetingId, user, callback) ->
  userId = user.userid

  u = Meteor.Users.findOne({userId:user.userid, meetingId: meetingId})
  # the collection already contains an entry for this user
  # because the user is reconnecting OR
  # in the case of an html5 client user we added a dummy user on
  # register_user_message (to save authToken)
  if u? and u.authToken?

    Meteor.Users.update({userId:user.userid, meetingId: meetingId}, {$set:{
      user:
        userid: user.userid
        presenter: user.presenter
        name: user.name
        _sort_name: user.name.toLowerCase()
        phone_user: user.phone_user
        set_emoji_time: user.set_emoji_time
        emoji_status: user.emoji_status
        has_stream: user.has_stream
        role: user.role
        listenOnly: user.listenOnly
        extern_userid: user.extern_userid
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
      }}, (err) ->
        if err?
          Meteor.log.error "_error #{err} when trying to insert user #{userId}"
          callback()
        else
          funct = (cbk) ->
            Meteor.log.info "_(case1) UPDATING USER #{user.userid}, authToken=
            #{u.authToken}, locked=#{user.locked}, username=#{user.name}"
            cbk()

          funct(callback)
    )

    welcomeMessage = Meteor.config.defaultWelcomeMessage
    .replace /%%CONFNAME%%/, Meteor.Meetings.findOne({meetingId: meetingId})?.meetingName
    welcomeMessage = welcomeMessage + Meteor.config.defaultWelcomeMessageFooter
    # add the welcome message if it's not there already OR update time_of_joining
    Meteor.Chat.upsert({
      meetingId: meetingId
      userId: userId
      'message.chat_type': 'SYSTEM_MESSAGE'
      'message.to_userid': userId
    }, {
      meetingId: meetingId
      userId: userId
      message:
        chat_type: 'SYSTEM_MESSAGE'
        message: welcomeMessage
        from_color: '0x3399FF'
        to_userid: userId
        from_userid: 'SYSTEM_MESSAGE'
        from_username: ''
        from_time: user.timeOfJoining?.toString()
    }, (err) ->
      if err?
        Meteor.log.error "_error #{err} when trying to insert welcome message for #{userId}"
      else
        Meteor.log.info "_added/updated a system message in chat for user #{userId}"
      # note that we already called callback() when updating the user. Adding
      # the welcome message in the chat is not as vital and we can afford to
      # complete it when possible, without blocking the serial event messages processing
    )

  else
    # Meteor.log.info "NOTE: got user_joined_message #{user.name} #{user.userid}"
    Meteor.Users.upsert({meetingId: meetingId, userId: userId}, {
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
          funct = (cbk) ->
            Meteor.log.info "_joining user (case2) userid=[#{userId}]:#{user.name}.
            Users.size is now #{Meteor.Users.find({meetingId: meetingId}).count()}"
            cbk()

          funct(callback)
        else
          callback()
    )



@createDummyUser = (meetingId, userId, authToken) ->
  if Meteor.Users.findOne({userId:userId, meetingId: meetingId, authToken:authToken})?
    Meteor.log.info "html5 user userId:[#{userId}] from [#{meetingId}] tried to revalidate token"
  else
    Meteor.Users.insert({
      meetingId: meetingId
      userId: userId
      authToken: authToken
      clientType: "HTML5"
      validated: false #will be validated on validate_auth_token_reply
      }, (err, id) ->
        Meteor.log.info "_added a dummy html5 user with: userId=[#{userId}]
      Users.size is now #{Meteor.Users.find({meetingId: meetingId}).count()}"
    )

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
  u = Meteor.Users.findOne({meetingId:meetingId, userId:userId})
  if u?
    Meteor.Users.update({userId:userId, meetingId: meetingId},
      {$set:{'user.locked': isLocked}},
      (err, numChanged) ->
        if err?
          Meteor.log.error "_error #{err} while updating user #{userId} with lock settings"
        else
          Meteor.log.info "_setting user locked status for userid:[#{userId}] from [#{meetingId}] locked=#{isLocked}"
    )
    # if the user is sharing audio, he should be muted upon locking involving disableMic
    if u.user.role is 'VIEWER' and !u.user.listenOnly and u.user.voiceUser.joined and !u.user.voiceUser.muted and isLocked
      Meteor.call('muteUser', meetingId, u.userId, u.userId, u.authToken, true) #true for muted

  else
    Meteor.log.error "(unsuccessful-no such user) setting user locked status for userid:[#{userId}] from [#{meetingId}] locked=#{isLocked}"


# called on server start and on meeting end
@clearUsersCollection = (meetingId) ->
  if meetingId?
    Meteor.Users.remove({meetingId: meetingId}, (err) ->
      if err?
        Meteor.log.error "_error #{JSON.stringify err} while removing users from meeting #{meetingId}"
      else
        Meteor.log.info "_cleared Users Collection (meetingId: #{meetingId})!"
    )
  else
    Meteor.Users.remove({}, (err) ->
      if err?
        Meteor.log.error "_error #{JSON.stringify err} while removing users from all meetings!"
      else
        Meteor.log.info "_cleared Users Collection (all meetings)!"
    )
