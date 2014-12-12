Meteor.methods
  #
  # I dont know if this is okay to be server side. We need to call it from the router, but I don't know if any harm can be caused
  # by the client calling this
  #

  # Construct and send a message to bbb-web to validate the user
  validateAuthToken: (meetingId, userId, authToken) ->
    Meteor.log.info "sending a validate_auth_token with",
      userid: userId
      authToken: authToken
      meetingid: meetingId

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
      publish Meteor.config.redis.channels.toBBBApps.meeting, message
    else
      Meteor.log.info "did not have enough information to send a validate_auth_token message"

class Meteor.RedisPubSub
  constructor: (callback) ->
    Meteor.log.info "constructor RedisPubSub"

    @pubClient = redis.createClient()
    @subClient = redis.createClient()

    Meteor.log.info("Subscribing message on channel: #{Meteor.config.redis.channels.fromBBBApps}")

    @subClient.on "psubscribe", Meteor.bindEnvironment(@_onSubscribe)
    @subClient.on "pmessage", Meteor.bindEnvironment(@_onMessage)

    @subClient.psubscribe(Meteor.config.redis.channels.fromBBBApps)
    callback @

  _onSubscribe: (channel, count) =>
    Meteor.log.info "Subscribed to #{channel}"

    #grab data about all active meetings on the server
    message =
      "header":
        "name": "get_all_meetings_request"
      "payload": {} # I need this, otherwise bbb-apps won't recognize the message
    publish Meteor.config.redis.channels.toBBBApps.meeting, message

  _onMessage: (pattern, channel, jsonMsg) =>
    # TODO: this has to be in a try/catch block, otherwise the server will
    # crash if the message has a bad format

    message = JSON.parse(jsonMsg)
    correlationId = message.payload?.reply_to or message.header?.reply_to
    meetingId = message.payload?.meeting_id

    ignoredEventTypes = [
      "keep_alive_reply"
      "page_resized_message"
      "presentation_page_resized_message"
      "presentation_cursor_updated_message" # just because it's common. we handle it anyway
    ]

    if message?.header? and message?.payload?
      unless message.header.name in ignoredEventTypes
        Meteor.log.info "eventType=  #{message.header.name}  ",
          message: jsonMsg

      # handle voice events
      if message.header.name in ['user_left_voice_message', 'user_joined_voice_message', 'user_voice_talking_message', 'user_voice_muted_message']
        voiceUser = message.payload.user?.voiceUser
        updateVoiceUser meetingId, voiceUser
        return

      # listen only
      if message.header.name is 'user_listening_only'
        updateVoiceUser meetingId, {'web_userid': message.payload.userid, 'listenOnly': message.payload.listen_only}
        # most likely we don't need to ensure that the user's voiceUser's {talking, joined, muted, locked} are false by default #TODO?
        return

      if message.header.name is "get_all_meetings_reply"
        Meteor.log.info "Let's store some data for the running meetings so that when an HTML5 client joins everything is ready!"
        listOfMeetings = message.payload.meetings
        for meeting in listOfMeetings
          # we currently do not have voice_conf or duration in this message.
          addMeetingToCollection meeting.meetingID, meeting.meetingName, meeting.recorded, meeting.voiceBridge, meeting.duration
        return

      if message.header.name is "get_users_reply" and message.payload.requester_id is "nodeJSapp"
        unless Meteor.Meetings.findOne({MeetingId: message.payload.meeting_id})?
          users = message.payload.users
          for user in users
            user.timeOfJoining = message.header.current_time # TODO this might need to be removed
            userJoined meetingId, user
        return

      if message.header.name is "validate_auth_token_reply"
        return

      if message.header.name is "user_registered_message"
        createDummyUser message.payload.meeting_id, message.payload.user
        return

      if message.header.name is "user_joined_message"
        user = message.payload.user
        user.timeOfJoining = message.header.current_time
        userJoined meetingId, user
        return

      if message.header.name is "user_left_message"
        userId = message.payload.user?.userid
        if userId? and meetingId?
          markUserOffline meetingId, userId
        return

      if message.header.name is "disconnect_user_message"
        Meteor.log.info "a user(#{message.payload.userid}) was kicked out from meeting(#{message.payload.meeting_id})"
        return

      if message.header.name is "get_chat_history_reply" and message.payload.requester_id is "nodeJSapp"
        unless Meteor.Meetings.findOne({MeetingId: message.payload.meeting_id})?
          for chatMessage in message.payload.chat_history
            addChatToCollection meetingId, chatMessage
        return

      if message.header.name is "send_public_chat_message" or message.header.name is "send_private_chat_message"
        messageObject = message.payload.message
        # use current_time instead of message.from_time so that the chats from Flash and HTML5 have uniform times
        messageObject.from_time = message.header.current_time
        addChatToCollection meetingId, messageObject
        return

      if message.header.name is "meeting_created_message"
        meetingName = message.payload.name
        intendedForRecording = message.payload.recorded
        voiceConf = message.payload.voice_conf
        duration = message.payload.duration
        addMeetingToCollection meetingId, meetingName, intendedForRecording, voiceConf, duration
        return

      if message.header.name is "presentation_shared_message"
        presentationId = message.payload.presentation?.id
        # change the currently displayed presentation to presentation.current = false
        Meteor.Presentations.update({"presentation.current": true, meetingId: meetingId},{$set: {"presentation.current": false}})

        #update(if already present) entirely the presentation with the fresh data
        removePresentationFromCollection meetingId, presentationId
        addPresentationToCollection meetingId, message.payload.presentation

        for slide in message.payload.presentation?.pages
          addSlideToCollection meetingId, message.payload.presentation?.id, slide
          if slide.current
            displayThisSlide meetingId, slide.id, slide
        return

      if message.header.name is "get_presentation_info_reply" and message.payload.requester_id is "nodeJSapp"
        for presentation in message.payload.presentations
          addPresentationToCollection meetingId, presentation

          for page in presentation.pages
            #add the slide to the collection
            addSlideToCollection meetingId, presentation.id, page

            #request for shapes
            whiteboardId = "#{presentation.id}/#{page.num}" # d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1404411622872/1
            #Meteor.log.info "the whiteboard_id here is:" + whiteboardId

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
              publish Meteor.config.redis.channels.toBBBApps.whiteboard, message
            else
              Meteor.log.info "did not have enough information to send a user_leaving_request"
        return

      if message.header.name is "presentation_page_changed_message"
        newSlide = message.payload.page
        displayThisSlide meetingId, newSlide?.id, newSlide
        return

      if message.header.name is "get_whiteboard_shapes_reply" and message.payload.requester_id is "nodeJSapp"
        for shape in message.payload.shapes
          whiteboardId = shape.wb_id
          addShapeToCollection meetingId, whiteboardId, shape
        return

      if message.header.name is "send_whiteboard_shape_message"
        shape = message.payload.shape
        whiteboardId = shape?.wb_id
        addShapeToCollection meetingId, whiteboardId, shape
        return

      if message.header.name is "presentation_cursor_updated_message"
        x = message.payload.x_percent
        y = message.payload.y_percent
        Meteor.Presentations.update({"presentation.current": true, meetingId: meetingId},{$set: {"pointer.x": x, "pointer.y": y}})
        return

      if message.header.name is "whiteboard_cleared_message"
        whiteboardId = message.payload.whiteboard_id
        removeAllShapesFromSlide meetingId, whiteboardId
        return

      if message.header.name is "undo_whiteboard_request"
        whiteboardId = message.payload.whiteboard_id
        shapeId = message.payload.shape_id
        removeShapeFromSlide meetingId, whiteboardId, shapeId
        return

      if message.header.name is "presenter_assigned_message"
        newPresenterId = message.payload.new_presenter_id
        if newPresenterId?
          # reset the previous presenter
          Meteor.Users.update({"user.presenter": true, meetingId: meetingId},{$set: {"user.presenter": false}})
          # set the new presenter
          Meteor.Users.update({"user.userid": newPresenterId, meetingId: meetingId},{$set: {"user.presenter": true}})
        return

      if message.header.name is "presentation_page_resized_message"
        slideId = message.payload.page?.id
        heightRatio = message.payload.page?.height_ratio
        widthRatio = message.payload.page?.width_ratio
        xOffset = message.payload.page?.x_offset
        yOffset = message.payload.page?.y_offset
        presentationId = slideId.split("/")[0]
        Meteor.Slides.update({presentationId: presentationId, "slide.current": true}, {$set: {"slide.height_ratio": heightRatio, "slide.width_ratio": widthRatio, "slide.x_offset": xOffset, "slide.y_offset": yOffset}})
        return

      if message.header.name is "user_raised_hand_message"
        userId = message.payload.userid
        meetingId = message.payload.meeting_id
        if userId? and meetingId?
          last_raised = new Date()
          Meteor.Users.update({"user.userid": userId},{$set: {"user.raise_hand": last_raised}})
        return

      if message.header.name is "user_lowered_hand_message"
        userId = message.payload.userid
        meetingId = message.payload.meeting_id
        if userId? and meetingId?
          Meteor.Users.update({"user.userid": userId, meetingId: meetingId},{$set: {"user.raise_hand": 0}})
        return

      if message.header.name is "recording_status_changed_message"
        intendedForRecording = message.payload.recorded
        currentlyBeingRecorded = message.payload.recording
        Meteor.Meetings.update({meetingId: meetingId, intendedForRecording: intendedForRecording}, {$set: {currentlyBeingRecorded: currentlyBeingRecorded}})
        return

      if message.header.name in ["meeting_ended_message", "meeting_destroyed_event",
        "end_and_kick_all_message", "disconnect_all_users_message"]
        if Meteor.Meetings.findOne({meetingId: meetingId})?
          Meteor.log.info "there are #{Meteor.Users.find({meetingId: meetingId}).count()} users in the meeting"
          for user in Meteor.Users.find({meetingId: meetingId}).fetch()
            markUserOffline meetingId, user.userId
            #TODO should we clear the chat messages for that meeting?!
          unless message.header.name is "disconnect_all_users_message"
            removeMeetingFromCollection meetingId
        return

# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------

# message should be an object
@publish = (channel, message) ->
  Meteor.log.info "Publishing",
    channel: channel
    message: message

  if Meteor.redisPubSub?
    Meteor.redisPubSub.pubClient.publish channel, JSON.stringify(message), (err, res) ->
      if err
        Meteor.log.info "error",
          error: err

  else
    Meteor.log.info "ERROR!! Meteor.redisPubSub was undefined"
