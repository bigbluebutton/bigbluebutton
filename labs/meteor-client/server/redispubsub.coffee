###
redis  = Meteor.require 'redis'
crypto = Meteor.require 'crypto'
postal = Meteor.require 'postal'

class Meteor.RedisPubSub

  console.log "initializing"
  pubClient = redis.createClient()
  subClient = redis.createClient()

  #subClient.on "psubscribe", @_onSubscribe
  #subClient.on "pmessage", @_onMessage

  #log.info
  console.log("RPC: Subscribing message on channel: #{Meteor.config.redis.channels.fromBBBApps}")
  subClient.psubscribe(Meteor.config.redis.channels.fromBBBApps)


  #Sends a message and waits for a reply
  sendAndWaitForReply: (message, envelope) ->
    # generate a unique correlation id for this call
    correlationId = crypto.randomBytes(16).toString('hex')

    # create a timeout for what should happen if we don't get a response
    timeoutId = setTimeout( (correlationId) =>
      response = {}
      # if this ever gets called we didn't get a response in a timely fashion
      response.err =
        code: "503"
        message: "Waiting for reply timeout."
        description: "Waiting for reply timeout."
      postal.publish
        channel: envelope.replyTo.channel
        topic: envelope.replyTo.topic
        data: response
      # delete the entry from hash
      delete @pendingRequests[correlationId]
    , Meteor.config.redis.timeout, correlationId)

    # create a request entry to store in a hash
    entry =
      replyTo: envelope.replyTo
      timeout: timeoutId #the id for the timeout so we can clear it

    # put the entry in the hash so we can match the response later
    @pendingRequests[correlationId] = entry
    message.header.reply_to = correlationId
    console.log "\n  Waiting for a reply on:" + JSON.stringify(message)
    #log.info
    console.log({ message: message, channel: Meteor.config.redis.channels.toBBBApps.meeting}, "Publishing a message")
    @pubClient.publish(Meteor.config.redis.channels.toBBBApps.meeting, JSON.stringify(message))


  _onSubscribe: (channel, count) =>
    #log.info
    console.log("Subscribed to #{channel}")

  _onMessage: (pattern, channel, jsonMsg) =>
    # TODO: this has to be in a try/catch block, otherwise the server will
    #   crash if the message has a bad format
    message = JSON.parse(jsonMsg)
    correlationId = message.payload?.reply_to or message.header?.reply_to

    unless message.header?.name is "keep_alive_reply"
      console.log "\nchannel=" + channel
      console.log "correlationId=" + correlationId if correlationId?
      console.log "eventType=" + message.header?.name + "\n"
      #log.debug
      console.log({ pattern: pattern, channel: channel, message: message}, "Received a message from redis")

    # retrieve the request entry

    if correlationId? and @pendingRequests?[correlationId]?
      entry = @pendingRequests[correlationId]
      # make sure the message in the timeout isn't triggered by clearing it
      clearTimeout(entry.timeout)

      delete @pendingRequests[correlationId]
      postal.publish
        channel: entry.replyTo.channel
        topic: entry.replyTo.topic
        data: message
    else
      if message.header?.name is 'get_presentation_info_reply'
        #filter for the current=true page on the server-side
        currentPage = null
        numCurrentPage = null
        presentations = message.payload?.presentations

        for presentation in presentations
          pages = presentation.pages

          for page in pages
            if page.current is true
              currentPage = page
              numCurrentPage = page.num

        console.log "\n\n\n\n the message is: " + JSON.stringify message
        console.log "\n" + message.payload?.presentations[0]?.id + "/" + numCurrentPage + "\n\n"
        #request the whiteboard information
        requestMessage = {
          "payload": {
            "meeting_id": message.payload?.meeting_id
            "requester_id": message.payload?.requester_id
            "whiteboard_id": message.payload?.presentations[0]?.id + "/" + numCurrentPage #not sure if always [0]
          },
          "header": {
            "timestamp": new Date().getTime()
            "name": "get_whiteboard_shapes_request"
          }
        }
        @publishing(Meteor.config.redis.channels.toBBBApps.whiteboard, requestMessage)

        #strip off excess data, leaving only the current slide information
        message.payload.currentPage = currentPage
        message.payload.presentations = null
        message.header.name = "presentation_page"

      else if message.header?.name is 'presentation_shared_message'
        currentPage = null
        presentation = message.payload?.presentation
        for page in presentation.pages
          if page.current is true
            currentPage = page

        #strip off excess data, leaving only the current slide information
        message.payload.currentPage = currentPage
        message.payload.presentation = null
        message.header.name = "presentation_page"

      else if message.header?.name is 'presentation_page_changed_message'
        message.payload.currentPage = message.payload?.page
        message.payload?.page = null
        message.header.name = "presentation_page"

      console.log "  Sending to Controller (In):" + message.header?.name
      sendToController(message)

  sendValidateAuthToken: (meetingId, userId, authToken) =>
    console.log "\n\n\n\n i am sending a validate_auth_token with " + userId + "" + meetingId
    message = {
      "payload": {
        "auth_token": authToken
        "userid": userId
        "meeting_id": meetingId
      },
      "header": {
        "timestamp": new Date().getTime()
        "name": "validate_auth_token"
      }
    }
    if authToken? and userId? and meetingId?
      console.log "yes"
      pubClient.publish(Meteor.config.redis.channels.toBBBApps.meeting, JSON.stringify(message))
###