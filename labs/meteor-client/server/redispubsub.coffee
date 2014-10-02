Meteor.methods
  # 
  # I dont know if this is okay to be server side. We need to call it from the router, but I don't know if any harm can be caused
  # by the client calling this
  # 

  # Construct and send a message to bbb-web to validate the user
  validateAuthToken: (meetingId, userId, authToken) ->
    console.log "\n\n sending a validate_auth_token with userid=#{userId} meetingid=#{meetingId}"

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
      console.log "did not have enough information to send a validate_auth_token message"

class Meteor.RedisPubSub
  constructor: (callback) ->
    console.log "constructor RedisPubSub"

    @pubClient = redis.createClient()
    @subClient = redis.createClient()
        
    console.log("Subscribing message on channel: #{Meteor.config.redis.channels.fromBBBApps}")

    #log.info      
    @subClient.on "psubscribe", Meteor.bindEnvironment(@_onSubscribe)
    @subClient.on "pmessage", Meteor.bindEnvironment(@_onMessage)

    @subClient.psubscribe(Meteor.config.redis.channels.fromBBBApps)
    callback @

  _onSubscribe: (channel, count) =>
    console.log "Subscribed to #{channel}"

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

    if message.header? and message.payload?
      unless message.header.name in ignoredEventTypes
        console.log "eventType=" + message.header.name #+ "\n"
        console.log jsonMsg

      # handle voice events
      if message.header.name in ['user_left_voice_message', 'user_joined_voice_message', 'user_voice_talking_message', 'user_voice_muted_message']
        voiceUser = message.payload.user?.voiceUser
        updateVoiceUser meetingId, voiceUser

      # listen only
      if message.header.name is 'user_listening_only'
        u = Meteor.Users.findOne({userId: message.payload.userid, meetingId: meetingId})
        updateVoiceUser {'user_id': u._id, 'listenOnly': message.payload.listen_only}
        # most likely we don't need to ensure that the user's voiceUser's {talking, joined, muted, locked} are false by default #TODO?

      if message.header.name is "get_all_meetings_reply"
        console.log "Let's store some data for the running meetings so that when an HTML5 client joins everything is ready!"
        listOfMeetings = message.payload.meetings
        for meeting in listOfMeetings
          # we currently do not have voice_conf or duration in this message.
          addMeetingToCollection meeting.meetingID, meeting.meetingName, meeting.recorded, meeting.voiceBridge, meeting.duration

      if message.header.name is "get_users_reply" and message.payload.requester_id is "nodeJSapp"
        unless Meteor.Meetings.findOne({MeetingId: message.payload.meeting_id})?
          users = message.payload.users
          for user in users
            user.timeOfJoining = message.header.current_time # TODO this might need to be removed
            addUserToCollection meetingId, user

      if message.header.name is "user_joined_message"
        user = message.payload.user
        user.timeOfJoining = message.header.current_time
        addUserToCollection meetingId, user

      if message.header.name is "user_left_message"
        userId = message.payload.user?.userid
        if userId? and meetingId?
          removeUserFromMeeting meetingId, userId

      if message.header.name is "get_chat_history_reply" and message.payload.requester_id is "nodeJSapp"
        unless Meteor.Meetings.findOne({MeetingId: message.payload.meeting_id})?
          for chatMessage in message.payload.chat_history
            addChatToCollection meetingId, chatMessage

      if message.header.name is "send_public_chat_message" or message.header.name is "send_private_chat_message"
        messageObject = message.payload.message
        # use current_time instead of message.from_time so that the chats from Flash and HTML5 have uniform times
        messageObject.from_time = message.header.current_time
        addChatToCollection meetingId, messageObject

      if message.header.name is "meeting_created_message"
        meetingName = message.payload.name
        intendedForRecording = message.payload.recorded
        voiceConf = message.payload.voice_conf
        duration = message.payload.duration
        addMeetingToCollection meetingId, meetingName, intendedForRecording, voiceConf, duration

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

      if message.header.name is "get_presentation_info_reply" and message.payload.requester_id is "nodeJSapp"
        for presentation in message.payload.presentations
          addPresentationToCollection meetingId, presentation

          for page in presentation.pages
            #add the slide to the collection
            addSlideToCollection meetingId, presentation.id, page

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
              publish Meteor.config.redis.channels.toBBBApps.whiteboard, message
            else
              console.log "did not have enough information to send a user_leaving_request"

      if message.header.name is "presentation_page_changed_message"
        newSlide = message.payload.page
        displayThisSlide meetingId, newSlide?.id, newSlide

      if message.header.name is "get_whiteboard_shapes_reply" and message.payload.requester_id is "nodeJSapp"
        for shape in message.payload.shapes
          whiteboardId = shape.wb_id
          addShapeToCollection meetingId, whiteboardId, shape

      if message.header.name is "send_whiteboard_shape_message"
        shape = message.payload.shape
        whiteboardId = shape?.wb_id
        addShapeToCollection meetingId, whiteboardId, shape

      if message.header.name is "presentation_cursor_updated_message"
        x = message.payload.x_percent
        y = message.payload.y_percent
        Meteor.Presentations.update({"presentation.current": true, meetingId: meetingId},{$set: {"pointer.x": x, "pointer.y": y}})

      if message.header.name is "whiteboard_cleared_message"
        whiteboardId = message.payload.whiteboard_id
        removeAllShapesFromSlide meetingId, whiteboardId

      if message.header.name is "undo_whiteboard_request"
        whiteboardId = message.payload.whiteboard_id
        shapeId = message.payload.shape_id
        removeShapeFromSlide meetingId, whiteboardId, shapeId

      if message.header.name is "presenter_assigned_message"
        newPresenterId = message.payload.new_presenter_id
        if newPresenterId?
          # reset the previous presenter
          Meteor.Users.update({"user.presenter": true, meetingId: meetingId},{$set: {"user.presenter": false}})
          # set the new presenter
          Meteor.Users.update({"user.userid": newPresenterId, meetingId: meetingId},{$set: {"user.presenter": true}})

      if message.header.name is "presentation_page_resized_message"
        slideId = message.payload.page?.id
        heightRatio = message.payload.page?.height_ratio
        widthRatio = message.payload.page?.width_ratio
        xOffset = message.payload.page?.x_offset
        yOffset = message.payload.page?.y_offset
        presentationId = slideId.split("/")[0]
        Meteor.Slides.update({presentationId: presentationId, "slide.current": true}, {$set: {"slide.height_ratio": heightRatio, "slide.width_ratio": widthRatio, "slide.x_offset": xOffset, "slide.y_offset": yOffset}})

      if message.header.name is "user_raised_hand_message"
        userId = message.payload.userid
        # update the user
        Meteor.Users.update({"user.userid": userId, meetingId: meetingId},{$set: {"user.raise_hand": true}}) #not sure why but message.payload.raise_hand is awlays false

      if message.header.name is "user_lowered_hand_message"
        userId = message.payload.userid
        # update the user
        Meteor.Users.update({"user.userid": userId, meetingId: meetingId},{$set: {"user.raise_hand": false}}) #not sure why but message.payload.raise_hand is awlays false

      if message.header.name is "recording_status_changed_message"
        intendedForRecording = message.payload.recorded
        currentlyBeingRecorded = message.payload.recording
        Meteor.Meetings.update({meetingId: meetingId, intendedForRecording: intendedForRecording}, {$set: {currentlyBeingRecorded: currentlyBeingRecorded}})

      if message.header.name in ["meeting_ended_message", "meeting_destroyed_event",
        "end_and_kick_all_message", "disconnect_all_users_message"]
        if Meteor.Meetings.findOne({meetingId: meetingId})?
          console.log "there are #{Meteor.Users.find({meetingId: meetingId}).count()} users in the meeting"
          for user in Meteor.Users.find({meetingId: meetingId}).fetch()
            removeUserFromMeeting meetingId, user.userId
            #TODO should we clear the chat messages for that meeting?!
          unless message.header.name is "disconnect_all_users_message"
            removeMeetingFromCollection meetingId

# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------

# message should be an object
@publish = (channel, message) ->
	console.log "Publishing channel=#{channel}, message=#{JSON.stringify(message)}"
	if Meteor.redisPubSub?
		Meteor.redisPubSub.pubClient.publish(channel, JSON.stringify(message), (err, res) ->
			if err
				console.log "err=" + err
		)
	else
		console.log "\n ERROR!! Meteor.redisPubSub was undefined\n"
