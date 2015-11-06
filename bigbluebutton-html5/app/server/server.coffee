Meteor.startup ->
  Meteor.log.info "server start"

  #remove all data
  Meteor.WhiteboardCleanStatus.remove({})
  clearUsersCollection()
  clearChatCollection()
  clearMeetingsCollection()
  clearShapesCollection()
  clearSlidesCollection()
  clearPresentationsCollection()
  clearPollCollection()

  # create create a PubSub connection, start listening
  Meteor.redisPubSub = new Meteor.RedisPubSub(->
    Meteor.log.info "created pubsub")


  Meteor.myQueue = new PowerQueue({
    # autoStart:true
    # isPaused: true
  })
  Meteor.myQueue.taskHandler = (data, next, failures) ->
    eventName = JSON.parse(data.jsonMsg)?.header.name
    if failures > 0
      Meteor.log.error "got a failure on taskHandler #{eventName} #{failures}"
    else
      handleRedisMessage(data, ()->
        Meteor.log.error "in callback after handleRedisMessage #{eventName}"
        next()
      )

  # To ensure that we process the redis json event messages serially we use a
  # callback. This callback is to be called when the Meteor collection is
  # updated with the information coming in the payload of the json message. The
  # callback signalizes to the queue that we are done processing the current
  # message in the queue and are ready to move on to the next one. If we do not
  # use the callback mechanism we may encounter a race condition situation
  # due to not following the order of events coming through the redis pubsub.
  # for example: a user_left event reaching the collection before a user_joined
  # for the same user.
  @handleRedisMessage = (data, callback) ->
    message = JSON.parse(data.jsonMsg)
    # correlationId = message.payload?.reply_to or message.header?.reply_to
    meetingId = message.payload?.meeting_id

    # Avoid cluttering the log with json messages carrying little or repetitive
    # information. Comment out a message type in the array to be able to see it
    # in the log upon restarting of the Meteor process.
    notLoggedEventTypes = [
      "keep_alive_reply"
      "page_resized_message"
      "presentation_page_resized_message"
      "presentation_cursor_updated_message"
      "get_presentation_info_reply"
      "get_users_reply"
      "get_chat_history_reply"
      "get_all_meetings_reply"
      "get_whiteboard_shapes_reply"
      "presentation_shared_message"
      "presentation_conversion_done_message"
      "presentation_conversion_progress_message"
      "presentation_page_generated_message"
      # "presentation_page_changed_message"
      "BbbPubSubPongMessage"
      "bbb_apps_is_alive_message"
      "user_voice_talking_message"
      "meeting_state_message"
      "get_recording_status_reply"
    ]

    # TODO check if message
    eventName = message.header.name
    meetingId = message.payload?.meeting_id
    # we currently disregard the pattern and channel
    # Meteor.log.info "in handleRedisMessage #{eventName}"
    if message?.header? and message?.payload?
      if eventName is 'meeting_created_message'
        # Meteor.log.error JSON.stringify message
        meetingName = message.payload.name
        intendedForRecording = message.payload.recorded
        voiceConf = message.payload.voice_conf
        duration = message.payload.duration
        addMeetingToCollection meetingId, meetingName, intendedForRecording,
         voiceConf, duration, callback

      # handle voice events
      else if message.payload.user? and eventName in [
       'user_left_voice_message'
       'user_joined_voice_message'
       'user_voice_talking_message'
       'user_voice_muted_message']

        voiceUserObj = {
          'web_userid': message.payload.user.voiceUser.web_userid
          'listen_only': message.payload.listen_only
          'talking': message.payload.user.voiceUser.talking
          'joined': message.payload.user.voiceUser.joined
          'locked': message.payload.user.voiceUser.locked
          'muted': message.payload.user.voiceUser.muted
        }
        updateVoiceUser meetingId, voiceUserObj, callback

      else if eventName is 'user_listening_only'
        voiceUserObj = {
          'web_userid': message.payload.userid
          'listen_only': message.payload.listen_only
        }
        updateVoiceUser meetingId, voiceUserObj, callback

      else if eventName is 'get_all_meetings_reply'
        Meteor.log.info "Let's store some data for the running meetings
         so that when an HTML5 client joins everything is ready!"
        Meteor.log.info JSON.stringify(message)
        listOfMeetings = message.payload.meetings

        # Processing the meetings recursively with a callback to notify us,
        # ensuring that we update the meeting collection serially
        processMeeting = () ->
          meeting = listOfMeetings.pop()
          if meeting?
            addMeetingToCollection meeting.meetingID, meeting.meetingName,
              meeting.recorded, meeting.voiceBridge, meeting.duration, processMeeting
          else
            callback() # all meeting arrays (if any) have been processed

        processMeeting()

      else if eventName is 'user_joined_message'
        Meteor.log.error "\n\n user_joined_message \n\n" + JSON.stringify message
        userObj = message.payload.user
        dbUser = Meteor.Users.findOne({userId: userObj.userid, meetingId: message.payload.meeting_id})

        # On attempting reconnection of Flash clients (in voiceBridge) we receive
        # an extra user_joined_message. Ignore it as it will add an extra user
        # in the user list, creating discrepancy with the list in the Flash client
        if dbUser?.user?.connection_status is "offline" and message.payload.user?.phone_user
          Meteor.log.error "offline AND phone user"
          callback() #return without joining the user
        else
          if dbUser?.clientType is "HTML5" # typically html5 users will be in
            # the db [as a dummy user] before the joining message
            status = dbUser?.validated
            Meteor.log.info "in user_joined_message the validStatus
             of the user was #{status}"
            userObj.timeOfJoining = message.header.current_time
            userJoined meetingId, userObj, callback
          else
            userJoined meetingId, userObj, callback



      # only process if requester is nodeJSapp means only process in the case when
      # we explicitly request the users
      else if eventName is 'get_users_reply' and message.payload.requester_id is 'nodeJSapp'

        Meteor.log.error JSON.stringify(message)
        if !Meteor.Meetings.findOne({meetingId: meetingId})? #TODO consider removing this cond
          users = message.payload.users

          #TODO make the serialization be split per meeting. This will allow us to
          # use N threads vs 1 and we'll take advantage of Mongo's concurrency tricks

          # Processing the users recursively with a callback to notify us,
          # ensuring that we update the users collection serially
          processUser = () ->
            console.log "1"
            user = users.pop()
            if user?
              console.log "2"
              user.timeOfJoining = message.header.current_time
              if user.emoji_status isnt 'none' and typeof user.emoji_status is 'string'
                console.log "3"
                user.set_emoji_time = new Date()
                userJoined meetingId, user, processUser
              else
                console.error("this is not supposed to happen")
                userJoined meetingId, user, processUser
            else
              console.log "4"
              callback() # all meeting arrays (if any) have been processed

          processUser()
        else
          callback() #TODO test if we get here


      else if eventName is 'validate_auth_token_reply'
        userId = message.payload.userid
        user = Meteor.Users.findOne({userId:userId, meetingId: meetingId})
        validStatus = message.payload.valid

        # if the user already exists in the db
        if user?.clientType is "HTML5"
          #if the html5 client user was validated successfully, add a flag
          Meteor.Users.update({userId:userId, meetingId:message.payload.meeting_id},
            {$set:{validated: validStatus}},
            (err, numChanged) ->
              if numChanged.insertedId?
                funct = (cbk) ->
                  val=Meteor.Users.findOne({userId:userId, meetingId: message.payload.meeting_id})?.validated
                  Meteor.log.info "user.validated for user #{userId} in meeting #{user.meetingId} just became #{val}"
                  cbk()

                funct(callback)
              else
                callback()
          )
        else
          Meteor.log.info "a non-html5 user got validate_auth_token_reply."
          callback()



      else if eventName is 'user_left_message'
        userId = message.payload.user?.userid
        if userId? and meetingId?
          markUserOffline meetingId, userId, callback
        else
          callback() #TODO check how to get these cases out and reuse code









      # for now not handling this serially #TODO
      else if eventName is 'presenter_assigned_message'
        newPresenterId = message.payload.new_presenter_id
        if newPresenterId?
          # reset the previous presenter
          Meteor.Users.update({"user.presenter": true, meetingId: meetingId},
            {$set: {"user.presenter": false}},
            (err, numUpdated) ->
              Meteor.log.info(" Updating old presenter numUpdated=#{numUpdated},
               err=#{err}")
          )
          # set the new presenter
          Meteor.Users.update({"user.userid": newPresenterId, meetingId: meetingId},
            {$set: {"user.presenter": true}},
            (err, numUpdated) ->
              Meteor.log.info(" Updating new presenter numUpdated=#{numUpdated},
               err=#{err}")
          )
        callback()

      # for now not handling this serially #TODO
      else if eventName is 'user_emoji_status_message'
        userId = message.payload.userid
        meetingId = message.payload.meeting_id
        emojiStatus = message.payload.emoji_status
        if userId? and meetingId?
          set_emoji_time = new Date()
          Meteor.Users.update({"user.userid": userId},
            {$set:{"user.set_emoji_time":set_emoji_time,"user.emoji_status":emojiStatus}},
            (err, numUpdated) ->
              Meteor.log.info(" Updating emoji numUpdated=#{numUpdated}, err=#{err}")
          )
        callback()

      # for now not handling this serially #TODO
      else if eventName in ['user_locked_message', 'user_unlocked_message']
        userId = message.payload.userid
        isLocked = message.payload.locked
        setUserLockedStatus(meetingId, userId, isLocked)
        callback()

      # for now not handling this serially #TODO
      else if eventName in ["meeting_ended_message", "meeting_destroyed_event",
        "end_and_kick_all_message", "disconnect_all_users_message"]
        Meteor.log.info("DESTROYING MEETING #{meetingId}")
        removeMeetingFromCollection meetingId, callback

        ###
         if Meteor.Meetings.findOne({meetingId: meetingId})?
          count=Meteor.Users.find({meetingId: meetingId}).count()
          Meteor.log.info "there are #{count} users in the meeting"
          for user in Meteor.Users.find({meetingId: meetingId}).fetch()
            markUserOffline meetingId, user.userId
          #TODO should we clear the chat messages for that meeting?!
          unless eventName is "disconnect_all_users_message"
            removeMeetingFromCollection meetingId
        ###

      # for now not handling this serially #TODO
      else if eventName is "get_chat_history_reply" and message.payload.requester_id is "nodeJSapp"
        unless Meteor.Meetings.findOne({MeetingId: message.payload.meeting_id})?
          for chatMessage in message.payload.chat_history
            addChatToCollection meetingId, chatMessage
        callback()

      # for now not handling this serially #TODO
      else if eventName is "send_public_chat_message" or eventName is "send_private_chat_message"
        messageObject = message.payload.message
        # use current_time instead of message.from_time so that the chats from Flash and HTML5 have uniform times
        messageObject.from_time = message.header.current_time
        addChatToCollection meetingId, messageObject
        callback()

      # for now not handling this serially #TODO
      else if eventName is "presentation_shared_message"
        presentationId = message.payload.presentation?.id
        # change the currently displayed presentation to presentation.current = false
        Meteor.Presentations.update({"presentation.current": true, meetingId: meetingId},
          {$set: {"presentation.current": false}})

        #update(if already present) entirely the presentation with the fresh data
        removePresentationFromCollection meetingId, presentationId
        addPresentationToCollection meetingId, message.payload.presentation

        for slide in message.payload.presentation?.pages
          addSlideToCollection meetingId, message.payload.presentation?.id, slide
          if slide.current
            displayThisSlide meetingId, slide.id, slide
        callback()

      # for now not handling this serially #TODO
      else if eventName is "get_presentation_info_reply" and message.payload.requester_id is "nodeJSapp"
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
              publish Meteor.config.redis.channels.toBBBApps.whiteboard, message #TODO
            else
              Meteor.log.info "did not have enough information to send a user_leaving_request" #TODO
        callback()

      # for now not handling this serially #TODO
      else if eventName is "presentation_page_changed_message"
        newSlide = message.payload.page
        displayThisSlide meetingId, newSlide?.id, newSlide
        callback()

      # for now not handling this serially #TODO
      else if eventName is "get_whiteboard_shapes_reply" and message.payload.requester_id is "nodeJSapp"
        # Create a whiteboard clean status or find one for the current meeting
        if not Meteor.WhiteboardCleanStatus.findOne({meetingId: meetingId})?
          Meteor.WhiteboardCleanStatus.insert({meetingId: meetingId, in_progress: false})

        for shape in message.payload.shapes
          whiteboardId = shape.wb_id
          addShapeToCollection meetingId, whiteboardId, shape
        callback()

      # for now not handling this serially #TODO
      else if eventName is "send_whiteboard_shape_message"
        #Meteor stringifies an array of JSONs (...shape.result) in this message
        #parsing the String and reassigning the value
        if message.payload.shape.shape_type is "poll_result" and typeof message.payload.shape.shape.result is 'string'
          message.payload.shape.shape.result = JSON.parse message.payload.shape.shape.result

        shape = message.payload.shape
        whiteboardId = shape?.wb_id
        addShapeToCollection meetingId, whiteboardId, shape
        callback()

      # for now not handling this serially #TODO
      else if eventName is "presentation_cursor_updated_message"
        x = message.payload.x_percent
        y = message.payload.y_percent
        Meteor.Presentations.update({"presentation.current": true, meetingId: meetingId},
          {$set: {"pointer.x": x, "pointer.y": y}})
        callback()

      # for now not handling this serially #TODO
      else if eventName is "whiteboard_cleared_message"
        whiteboardId = message.payload.whiteboard_id
        Meteor.WhiteboardCleanStatus.update({meetingId: meetingId}, {$set: {'in_progress': true}})
        removeAllShapesFromSlide meetingId, whiteboardId
        callback()

      # for now not handling this serially #TODO
      else if eventName is "undo_whiteboard_request"
        whiteboardId = message.payload.whiteboard_id
        shapeId = message.payload.shape_id
        removeShapeFromSlide meetingId, whiteboardId, shapeId
        callback()


      # for now not handling this serially #TODO
      else if eventName is "presentation_page_resized_message"
        slideId = message.payload.page?.id
        heightRatio = message.payload.page?.height_ratio
        widthRatio = message.payload.page?.width_ratio
        xOffset = message.payload.page?.x_offset
        yOffset = message.payload.page?.y_offset
        presentationId = slideId.split("/")[0]
        Meteor.Slides.update({presentationId: presentationId, "slide.current": true},
          {$set:{"slide.height_ratio": heightRatio,"slide.width_ratio": widthRatio,"slide.x_offset":xOffset,"slide.y_offset":yOffset}}
        )
        callback()


      # for now not handling this serially #TODO
      else if eventName is "recording_status_changed_message"
        intendedForRecording = message.payload.recorded
        currentlyBeingRecorded = message.payload.recording
        Meteor.Meetings.update({meetingId: meetingId, intendedForRecording: intendedForRecording},
          {$set: {currentlyBeingRecorded: currentlyBeingRecorded}}
        )
        callback()

      # --------------------------------------------------
      # lock settings ------------------------------------
      # for now not handling this serially #TODO
      else if eventName is "eject_voice_user_message"
        callback()

      # for now not handling this serially #TODO
      else if eventName is "new_permission_settings"
        oldSettings = Meteor.Meetings.findOne({meetingId:meetingId})?.roomLockSettings
        newSettings = message.payload?.permissions

        # if the disableMic setting was turned on
        if !oldSettings?.disableMic and newSettings.disableMic
          handleLockingMic(meetingId, newSettings)

        # substitute with the new lock settings
        Meteor.Meetings.update({meetingId: meetingId}, {$set: {
          'roomLockSettings.disablePrivateChat': newSettings.disablePrivateChat
          'roomLockSettings.disableCam': newSettings.disableCam
          'roomLockSettings.disableMic': newSettings.disableMic
          'roomLockSettings.lockOnJoin': newSettings.lockOnJoin
          'roomLockSettings.lockedLayout': newSettings.lockedLayout
          'roomLockSettings.disablePublicChat': newSettings.disablePublicChat
          'roomLockSettings.lockOnJoinConfigurable': newSettings.lockOnJoinConfigurable #TODO
        }})
        callback()


      # for now not handling this serially #TODO
      else if eventName is "poll_started_message"
        if message.payload.meeting_id? and message.payload.requester_id? and message.payload.poll?
          if Meteor.Meetings.findOne({meetingId: message.payload.meeting_id})?
            #initializing the list of current users
            users = Meteor.Users.find({meetingId: message.payload.meeting_id},
              {fields:{"user.userid": 1, _id: 0}} ).fetch()
            addPollToCollection message.payload.poll, message.payload.requester_id,
              users, message.payload.meeting_id
        callback()

      # for now not handling this serially #TODO
      else if eventName is "poll_stopped_message"
        meetingId = message.payload.meeting_id
        poll_id = message.payload.poll_id
        clearPollCollection meetingId, poll_id
        callback()

      # for now not handling this serially #TODO
      else if eventName is "user_voted_poll_message"
        if message.payload?.poll? and message.payload.meeting_id? and message.payload.presenter_id?
          pollObj = message.payload.poll
          meetingId = message.payload.meeting_id
          requesterId = message.payload.presenter_id
          updatePollCollection pollObj, meetingId, requesterId
          callback()

      # for now not handling this serially #TODO
      else if eventName is "poll_show_result_message"
        if message.payload.poll.id? and message.payload.meeting_id?
          poll_id = message.payload.poll.id
          meetingId = message.payload.meeting_id
          clearPollCollection meetingId, poll_id
        callback()


      else # keep moving in the queue
        unless eventName in notLoggedEventTypes
          Meteor.log.info "WARNING!!!\n
          THE JSON MESSAGE WAS NOT OF TYPE SUPPORTED BY THIS APPLICATION\n
          #{eventName}   {JSON.stringify message}"
        callback()
