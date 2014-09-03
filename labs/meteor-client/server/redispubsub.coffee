Meteor.methods
  deletePrivateChatMessages: (user1, user2) ->
    console.log "deleting chat conversation"
    Meteor.Chat.remove({ # find all and remove private messages between the 2 users
        'message.chat_type': 'PRIVATE_CHAT',
        $or: [{'message.from_userid': user1, 'message.to_userid': user2},{'message.from_userid': user2, 'message.to_userid': user1}]
    })
    ###
    # TODO: Messages are now wiped from Meteor server
    # add code here to send request to redis to delete messages there as well or else all messages will be re populated
    ###

  validateAuthToken: (meetingId, userId, authToken) ->
    Meteor.redisPubSub.sendValidateToken(meetingId, userId, authToken)

  userLogout: (meetingId, userId) ->
    console.log "a user is logging out:" + userId
    #remove from the collection
    Meteor.call("removeUserFromCollection", meetingId, userId)
    #dispatch a message to redis
    Meteor.redisPubSub.sendUserLeavingRequest(meetingId, userId)

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
      # modify the collection
      Meteor.Users.update({userId:userId, meetingId: meetingId}, {$set:{'user.voiceUser.talking':false}})
      numChanged = Meteor.Users.update({userId:userId, meetingId: meetingId}, {$set:{'user.voiceUser.muted':mutedBoolean}})
      if numChanged isnt 1
        console.log "\n\nSomething went wrong!! We were supposed to mute/unmute 1 user!!\n\n"
    else
      console.log "did not have enough information to send a mute_user_request"

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
      console.log "just published for userLowerHand" + JSON.stringify message

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
      console.log "just published for userRaisedHand" + JSON.stringify message

      #update Users collection
      Meteor.Users.update({userId:userId, meetingId: meetingId}, {$set: {'user.raise_hand': true}})

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
      "page_resized_message"
      # "presentation_page_resized_message"
      "presentation_cursor_updated_message" # just because it's common. we handle it anyway
    ]

    unless message.header?.name in ignoredEventTypes
      #console.log "\nchannel=" + channel
      #console.log "correlationId=" + correlationId if correlationId?
      console.log "eventType=" + message.header?.name #+ "\n"
      #log.debug({ pattern: pattern, channel: channel, message: message}, "Received a message from redis")
      console.log jsonMsg

    if message.header?.name is 'user_voice_talking_message'
      u = Meteor.Users.findOne({'userId': message.payload?.user?.userid, 'meetingId': meetingId})
      if u?
        if not u?.user?.voiceUser?.muted
          console.log "setting talking to #{message?.payload?.user?.voiceUser?.talking}"
          Meteor.Users.update({_id:u._id}, {$set: {'user.voiceUser.talking':message?.payload?.user?.voiceUser?.talking}})
          Meteor.Users.update({_id:u._id}, {$set: {'user.voiceUser.joined':true}})
        else
          Meteor.Users.update({_id:u._id}, {$set: {'user.voiceUser.talking':false}})

    if message.header?.name is 'user_voice_muted_message'
      u = Meteor.Users.findOne({'userId': message.payload?.user?.userid, 'meetingId': meetingId})
      console.log "\n\n\n got a muted event and the user is #{u}"

      if u?
        # make sure the user is not currently in talking mode
        Meteor.Users.update({_id:u._id}, {$set: {'user.voiceUser.talking': false}})
        # update to muted
        Meteor.Users.update({_id:u._id}, {$set: {'user.voiceUser.muted':message?.payload?.user?.voiceUser?.muted}})
      else console.log "ERROR!! did not find a matching user to mute!!"

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
      unless Meteor.Meetings.findOne({MeetingId: message.payload?.meeting_id})? # TODO check if MeetingId or meetingId!!
        for chatMessage in message.payload?.chat_history
          Meteor.call("addChatToCollection", meetingId, chatMessage)

    if message.header?.name is "send_public_chat_message" or message.header?.name is "send_private_chat_message"
      messageObject = message.payload?.message
      Meteor.call("addChatToCollection", meetingId, messageObject)

    if message.header?.name is "meeting_created_message"
      # the event message contains very little info, so we will
      # request for information for all the meetings and in
      # this way can keep the Meetings collection up to date
      console.log "just received a meeting_created_message\n\n\n"
      @invokeGetAllMeetingsRequest()

    if message.header?.name is "presentation_shared_message" # TODO TEST!!!
      presentationId = message.payload?.presentation?.id
      # change the currently displayed presentation to presentation.current = false
      Meteor.Presentations.update({"presentation.current": true, meetingId: meetingId},{$set: {"presentation.current": false}})

      #update(if already present) entirely the presentation with the fresh data
      Meteor.call("removePresentationFromCollection", meetingId, presentationId)
      Meteor.call("addPresentationToCollection", meetingId, message.payload?.presentation)

      for slide in message.payload?.presentation?.pages
        Meteor.call("addSlideToCollection", meetingId, message.payload?.presentation?.id, slide)
        if slide.current
          Meteor.call("displayThisSlide", meetingId, slide.id, slide)

    if message.header?.name is "get_presentation_info_reply" and message.payload?.requester_id is "nodeJSapp"
      # todo: grab the whiteboard shapes using the whiteboard_id we have here

      for presentation in message.payload?.presentations
        Meteor.call("addPresentationToCollection", meetingId, presentation)

        for page in presentation.pages
          #add the slide to the collection
          Meteor.call("addSlideToCollection", meetingId, presentation.id, page)

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

    if message.header?.name is "presentation_page_changed_message"
      newSlide = message.payload?.page
      Meteor.call("displayThisSlide", meetingId, newSlide?.id, newSlide)

    if message.header?.name is "get_whiteboard_shapes_reply" and message.payload?.requester_id is "nodeJSapp"
      for shape in message.payload.shapes
        whiteboardId = shape.wb_id
        Meteor.call("addShapeToCollection", meetingId, whiteboardId, shape)

    if message.header?.name is "send_whiteboard_shape_message"
      shape = message.payload?.shape
      whiteboardId = shape?.wb_id
      Meteor.call("addShapeToCollection", meetingId, whiteboardId, shape)

    if message.header?.name is "presentation_cursor_updated_message"
      x = message.payload?.x_percent
      y = message.payload?.y_percent

      Meteor.Presentations.update({"presentation.current": true, meetingId: meetingId},{$set: {"pointer.x": x, "pointer.y": y}})

    if message.header?.name is "whiteboard_cleared_message"
      whiteboardId = message.payload?.whiteboard_id
      # shapesOnSlide = Meteor.Shapes.find({whiteboardId:whiteboardId, meetingId: meetingId}).fetch()
      # console.log "shapesOnSlide:" + shapesOnSlide.size()
      
      Meteor.call("removeAllShapesFromSlide", meetingId, whiteboardId)

    if message.header?.name is "undo_whiteboard_request"
      whiteboardId = message.payload?.whiteboard_id
      shapeId = message.payload?.shape_id

      Meteor.call("removeShapeFromSlide", meetingId, whiteboardId, shapeId)

    if message.header?.name is "presenter_assigned_message"
      newPresenterId = message.payload?.new_presenter_id
      if newPresenterId?
        # reset the previous presenter
        Meteor.Users.update({"user.presenter": true, meetingId: meetingId},{$set: {"user.presenter": false}})
        # set the new presenter
        Meteor.Users.update({"user.userid": newPresenterId, meetingId: meetingId},{$set: {"user.presenter": true}})

    if message.header?.name is "presentation_page_resized_message"
      console.log "handling presentation_page_resized_message"
      slideId = message.payload?.page?.id
      heightRatio = message.payload?.page?.height_ratio
      widthRatio = message.payload?.page?.width_ratio
      xOffset = message.payload?.page?.x_offset
      yOffset = message.payload?.page?.y_offset
      console.log "__#{slideId}___#{heightRatio}___#{widthRatio}___#{xOffset}__#{yOffset}__"

    if message.header?.name is "user_raised_hand_message"
      userId = message.payload?.userid
      # update the user
      Meteor.Users.update({"user.userid": userId, meetingId: meetingId},{$set: {"user.raise_hand": true}}) #not sure why but message.payload?.raise_hand is awlays false

    if message.header?.name is "user_lowered_hand_message"
      userId = message.payload?.userid
      # update the user
      Meteor.Users.update({"user.userid": userId, meetingId: meetingId},{$set: {"user.raise_hand": false}}) #not sure why but message.payload?.raise_hand is awlays false

    if message.header?.name in ["meeting_ended_message", "meeting_destroyed_event",
      "end_and_kick_all_message", "disconnect_all_users_message"]
      if Meteor.Meetings.findOne({meetingId: meetingId})?
        console.log "there are #{Meteor.Users.find({meetingId: meetingId}).count()} users in the meeting"
        for user in Meteor.Users.find({meetingId: meetingId}).fetch()
          Meteor.call("removeUserFromCollection", meetingId, user.userId)
          #TODO should we clear the chat messages for that meeting?!
        unless message.header?.name is "disconnect_all_users_message"
          Meteor.call("removeMeetingFromCollection", meetingId)

  # message should be an object
  publish: (channel, message) ->
    console.log "Publishing channel=#{channel}, message=#{JSON.stringify(message)}"
    @pubClient.publish(channel, JSON.stringify(message), (err, res) ->
      console.log "err=" + err
      console.log "res=" + res
    )

  publishingChatMessage: (meetingId, chatObject) =>
    console.log "publishing a chat message to bbb-apps"

    eventName = ->
      if chatObject.chat_type is "PRIVATE_CHAT"
        "send_private_chat_message_request"
      else "send_public_chat_message_request"

    message =
      header :
        "timestamp": new Date().getTime()
        "name": eventName()
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
