Meteor.methods
  validate: (meetingId, userId, authToken) ->
    Meteor.redisPubSub.sendValidateToken(meetingId, userId, authToken)

  userLogout: (meetingId, userId) ->
    console.log "a user is logging out:" + userId
    #remove from the collection
    Meteor.call("removeUserFromCollection", meetingId, userId)
    #dispatch a message to redis
    Meteor.redisPubSub.sendUserLeavingRequest(meetingId, userId)

    console.log "destroying subscriptions----------------------------------"
    clearCollections()

    # will have to add some code in here to ensure the user with userId can not get back into the meeting since we cannot clear their client side data

  userKick: (meetingId, userId) ->
    console.log "#{userId} is being kicked"
    console.log "a user is logging out:" + userId
    #remove from the collection
    Meteor.call("removeUserFromCollection", meetingId, userId)
    #dispatch a message to redis
    Meteor.redisPubSub.sendUserLeavingRequest(meetingId, userId)

  publishChatMessage: (meetingId, messageObject) ->
    Meteor.redisPubSub.publishingChatMessage(meetingId, messageObject)

  publishMuteRequest: (meetingId, userId, requesterId, mutedBoolean) =>
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
    else
      console.log "did not have enough information to send a mute_user_request"


class Meteor.RedisPubSub
  constructor: (callback) ->
    console.log "constructor RedisPubSub"

    @pubClient = redis.createClient()
    @subClient = redis.createClient()
        
    console.log("RPC: Subscribing message on channel: #{Meteor.config.redis.channels.fromBBBApps}")

    #log.info      
    @subClient.on "psubscribe", Meteor.bindEnvironment(@_onSubscribe)
    @subClient.on "pmessage", Meteor.bindEnvironment(@_onMessage)

    @subClient.psubscribe(Meteor.config.redis.channels.fromBBBApps)
    callback @

  # Construct and send a message to bbb-web to validate the user
  sendValidateToken: (meetingId, userId, authToken) ->
    console.log "\n\n i am sending a validate_auth_token with " + userId + "" + meetingId

    message =
      "payload":
        "auth_token": authToken
        "userid": userId
        "meeting_id": meetingId
      "header":
        "timestamp": new Date().getTime()
        "reply_to": meetingId + "/" + userId
        "name": "validate_auth_token"

    if authToken? and userId? and meetingId?
      @pubClient.publish(Meteor.config.redis.channels.toBBBApps.meeting, JSON.stringify(message))
    else
      console.log "did not have enough information to send a validate_auth_token message"

  sendUserLeavingRequest: (meetingId, userId) ->
    console.log "\n\n sending a user_leaving_request for #{meetingId}:#{userId}"
    message =
      "payload":
        "meeting_id": meetingId
        "userid": userId
      "header":
        "timestamp": new Date().getTime()
        "name": "user_leaving_request"
        "version": "0.0.1"

    if userId? and meetingId?
      @pubClient.publish(Meteor.config.redis.channels.toBBBApps.users, JSON.stringify(message))
    else
      console.log "did not have enough information to send a user_leaving_request"

  _onSubscribe: (channel, count) =>
    console.log "Subscribed to #{channel}"
    @invokeGetAllMeetingsRequest()

  _onMessage: (pattern, channel, jsonMsg) =>
    # TODO: this has to be in a try/catch block, otherwise the server will
    # crash if the message has a bad format

    message = JSON.parse(jsonMsg)
    correlationId = message.payload?.reply_to or message.header?.reply_to
    meetingId = message.payload?.meeting_id

    ignoredEventTypes = [
      "keep_alive_reply"
      "presentation_cursor_updated_message"
      "page_resized_message"
      "presentation_page_resized_message"
    ]

    unless message.header?.name in ignoredEventTypes
      #console.log "\nchannel=" + channel
      #console.log "correlationId=" + correlationId if correlationId?
      console.log "eventType=" + message.header?.name #+ "\n"
      #log.debug({ pattern: pattern, channel: channel, message: message}, "Received a message from redis")
      console.log jsonMsg

    if message.header?.name is 'user_voice_talking_message'
      u = Meteor.Users.findOne({'userId': message.payload?.user?.userid})
      if u?
        console.log "setting talking to #{message?.payload?.user?.voiceUser?.talking}\n\n\n\n"
        Meteor.Users.update({_id:u._id}, {$set: {'user.voiceUser.talking':message?.payload?.user?.voiceUser?.talking}})


    if message.header?.name is "get_all_meetings_reply"
      console.log "Let's store some data for the running meetings so that when an HTML5 client joins everything is ready!"
      listOfMeetings = message.payload?.meetings
      for meeting in listOfMeetings
        Meteor.call("addMeetingToCollection", meeting.meetingID, meeting.meetingName, meeting.recorded)

    if message.header?.name is "get_users_reply" and message.payload?.requester_id is "nodeJSapp"
      unless Meteor.Meetings.findOne({MeetingId: message.payload?.meeting_id})?
        users = message.payload?.users
        for user in users
          Meteor.call("addUserToCollection", meetingId, user)

    if message.header?.name is "user_joined_message"
      user = message.payload.user
      Meteor.call("addUserToCollection", meetingId, user)

    if message.header?.name is "user_left_message"
      userId = message.payload?.user?.userid
      if userId? and meetingId?
        Meteor.call("removeUserFromCollection", meetingId, userId)

    if message.header?.name is "get_chat_history_reply" and message.payload?.requester_id is "nodeJSapp"
      unless Meteor.Meetings.findOne({MeetingId: message.payload?.meeting_id})?
        for chatMessage in message.payload?.chat_history
          Meteor.call("addChatToCollection", meetingId, chatMessage)

    if message.header?.name is "send_public_chat_message"
      messageObject = message.payload?.message
      Meteor.call("addChatToCollection", meetingId, messageObject)

    if message.header?.name is "meeting_created_message"
      # the event message contains very little info, so we will
      # request for information for all the meetings and in
      # this way can keep the Meetings collection up to date
      @invokeGetAllMeetingsRequest()

    if message.header?.name is "presentation_shared_message"
      for slide in message.payload?.presentation?.pages
        Meteor.call("addSlideToCollection", meetingId, slide.id, slide)

    if message.header?.name is "get_presentation_info_reply" and message.payload?.requester_id is "nodeJSapp"
      # to do: grab the whiteboard shapes using the whiteboard_id we have here

      for presentation in message.payload?.presentations
        for page in presentation.pages
          #add the slide to the collection
          Meteor.call("addSlideToCollection", meetingId, page.id, page)

          #request for shapes
          whiteboardId = "#{presentation.id}/#{page.num}" # d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1404411622872/1
          console.log "the whiteboard_id here is:" + whiteboardId

          message =
            "payload":
              "meeting_id": meetingId
              "requester_id": "nodeJSapp"
              "whiteboard_id": whiteboardId
            "header":
              "timestamp": new Date().getTime()
              "name": "get_whiteboard_shapes_request"
              "version": "0.0.1"

          if whiteboardId? and meetingId?
            @pubClient.publish(Meteor.config.redis.channels.toBBBApps.whiteboard, JSON.stringify(message))
          else
            console.log "did not have enough information to send a user_leaving_request"

    if message.header?.name is "get_whiteboard_shapes_reply" and message.payload?.requester_id is "nodeJSapp"
      for shape in message.payload.shapes
        whiteboardId = shape.wb_id
        Meteor.call("addShapeToCollection", meetingId, whiteboardId, shape)

    if message.header?.name is "send_whiteboard_shape_message"
      shape = message.payload?.shape
      whiteboardId = shape?.wb_id
      Meteor.call("addShapeToCollection", meetingId, whiteboardId, shape)

    if message.header?.name in ["meeting_ended_message", "meeting_destroyed_event",
      "end_and_kick_all_message", "disconnect_all_users_message"]
      if Meteor.Meetings.findOne({meetingId: meetingId})?
        console.log "there are #{Meteor.Users.find({meetingId: meetingId}).count()} users in the meeting"
        for user in Meteor.Users.find({meetingId: meetingId}).fetch()
          Meteor.call("removeUserFromCollection", meetingId, user.userId)
          #TODO should we clear the chat messages for that meeting?!
        unless message.header?.name is "disconnect_all_users_message"
          Meteor.call("removeMeetingFromCollection", meetingId)

    # We dispatch a request (mute_user_request) for a user to be muted/unmuted towards BBB-Apps
    # As a result a mute_voice_user_request is dispatched. We will use this message to
    # as a confirmation that the user was muted/unmuted
    if message.header?.name is "mute_voice_user_request"
      userId = message.payload?.userid
      requesterId = message.payload?.requester_id
      mutedBoolean = message.payload?.mute

      # modify the collection
      numChanged = Meteor.Users.update({userId:userId, meetingId: meetingId}, {$set:{'user.voiceUser.muted':mutedBoolean}})

      console.log "numChanged======" + numChanged

  # message should be an object
  publish: (channel, message) ->
    console.log "Publishing channel=#{channel}, message=#{JSON.stringify(message)}"
    @pubClient.publish(channel, JSON.stringify(message), (err, res) ->
      console.log "err=" + err
      console.log "res=" + res
    )

  publishingChatMessage: (meetingId, chatObject) =>
    console.log "publishing a chat message to bbb-apps"
    message =
      header :
        "timestamp": new Date().getTime()
        "name": "send_public_chat_message_request"
      payload:
        "message" : chatObject
        "meeting_id": meetingId
        "requester_id": chatObject.from_userid

    console.log "publishing:" + JSON.stringify (message)
    @pubClient.publish(Meteor.config.redis.channels.toBBBApps.chat, JSON.stringify (message))

  invokeGetAllMeetingsRequest: =>
    #grab data about all active meetings on the server
    message =
      "header":
        "name": "get_all_meetings_request"
      "payload": {} # I need this, otherwise bbb-apps won't recognize the message

    @pubClient.publish(Meteor.config.redis.channels.toBBBApps.meeting, JSON.stringify (message))
