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
    correlationId = message.payload?.reply_to or message.header?.reply_to
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

        updateVoiceUser meetingId, callback,
          'web_userid': message.payload.user.voiceUser.web_userid
          'listen_only': message.payload.listen_only
          'talking': message.payload.user.voiceUser.talking
          'joined': message.payload.user.voiceUser.joined
          'locked': message.payload.user.voiceUser.locked
          'muted': message.payload.user.voiceUser.muted

      else if eventName is 'user_listening_only'
        updateVoiceUser meetingId,
        {'web_userid': message.payload.userid
         'listen_only': message.payload.listen_only},
         callback

      else if eventName is 'get_all_meetings_reply'
        Meteor.log.info "Let's store some data for the running meetings
         so that when an HTML5 client joins everything is ready!"
        Meteor.log.info JSON.stringify(message)
        listOfMeetings = message.payload.meetings

        processMeeting = () ->
          meeting = listOfMeetings.pop()
          if meeting?
            addMeetingToCollection meeting.meetingID, meeting.meetingName,
              meeting.recorded, meeting.voiceBridge, meeting.duration, processMeeting
          else
            callback() # all meeting arrays (if any) have been processed

        processMeeting()

      else if eventName is 'user_joined_message'
        userObj = message.payload.user
        dbUser = Meteor.Users.findOne({userId: message.payload.user.userid
         meetingId: message.payload.meeting_id})

        # On attempting reconnection of Flash clients (in voiceBridge) we receive
        # an extra user_joined_message. Ignore it as it will add an extra user
        # in the user list, creating discrepancy with the list in the Flash client
        if dbUser?.user?.connection_status is "offline" and
         message.payload.user?.phone_user
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
        # return







      else # keep moving in the queue
        Meteor.log.info "WARNING!!!\n
        THE JSON MESSAGE WAS NOT OF TYPE SUPPORTED BY THIS APPLICATION\n
        #{eventName}   {JSON.stringify message}"
        callback()
