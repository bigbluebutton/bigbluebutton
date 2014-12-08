redis = require 'redis'
crypto = require 'crypto'
postal = require 'postal'

config = require '../config'
log = require './bbblogger'

module.exports = class RedisPubSub

  constructor: ->
    @pubClient = redis.createClient()
    @subClient = redis.createClient()

    # hash to store requests waiting for response
    @pendingRequests = {}

    postal.subscribe
      channel: config.redis.internalChannels.publish
      topic: 'broadcast'
      callback: (msg, envelope) =>
        if envelope.replyTo?
          @sendAndWaitForReply(msg, envelope)
        else
          @send(msg, envelope)

    @subClient.on "psubscribe", @_onSubscribe
    @subClient.on "pmessage", @_onMessage

    log.info("RPC: Subscribing message on channel: #{config.redis.channels.fromBBBApps}")
    @subClient.psubscribe(config.redis.channels.fromBBBApps)

  # Sends a message and waits for a reply
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
    , config.redis.timeout, correlationId)

    # create a request entry to store in a hash
    entry =
      replyTo: envelope.replyTo
      timeout: timeoutId #the id for the timeout so we can clear it

    # put the entry in the hash so we can match the response later
    @pendingRequests[correlationId] = entry
    message.header.reply_to = correlationId
    console.log("\n\nmessage=" + JSON.stringify(message) + "\n\n")
    log.info({ message: message, channel: config.redis.channels.toBBBApps.meeting}, "Publishing a message")
    @pubClient.publish(config.redis.channels.toBBBApps.meeting, JSON.stringify(message))

  # Send a message without waiting for a reply
  send: (message, envelope) ->
    # TODO

  _onSubscribe: (channel, count) =>
    log.info("Subscribed to #{channel}")

  _onMessage: (pattern, channel, jsonMsg) =>
    # TODO: this has to be in a try/catch block, otherwise the server will
    #   crash if the message has a bad format
    message = JSON.parse(jsonMsg)

    unless message.header?.name is "keep_alive_reply" #temporarily stop logging the keep_alive_reply message
      log.debug({ pattern: pattern, channel: channel, message: message}, "Received a message from redis")
    #console.log "=="+JSON.stringify message

    # retrieve the request entry

    #correlationId = message.header?.reply_to
    correlationId = message.payload?.reply_to or message.header?.reply_to
    console.log "\ncorrelation_id=" + correlationId
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
      #sendToController(message)

    if message.header?.name is 'validate_auth_token_reply'
      if message.payload?.valid is "true"

        #TODO use the message library for these messages. Perhaps put it in Modules?!

        joinMeetingMessage = {
          "payload": {
            "meeting_id": message.payload.meeting_id
            "user_id": message.payload.userid
          },
          "header": {
            "timestamp": new Date().getTime()
            "reply_to": message.payload.meeting_id + "/" + message.payload.userid
            "name": "user_joined_event"
          }
        }
        # the user joins the meeting

        @pubClient.publish(config.redis.channels.toBBBApps.users, JSON.stringify(joinMeetingMessage))
        console.log "just published the joinMeetingMessage in RedisPubSub"

        #get the list of users in the meeting
        getUsersMessage = {
          "payload": {
            "meeting_id": message.payload.meeting_id
            "requester_id": message.payload.userid
          },
          "header": {
            "timestamp": new Date().getTime()
            "reply_to": message.payload.meeting_id + "/" + message.payload.userid
            "name": "get_users_request"
          }
        }

        @pubClient.publish(config.redis.channels.toBBBApps.users, JSON.stringify(getUsersMessage))
        console.log "just published the getUsersMessage in RedisPubSub"

        #get the chat history
        getChatHistory = {
          "payload": {
            "meeting_id": message.payload.meeting_id
            "requester_id": message.payload.userid
          },
          "header": {
            "timestamp": new Date().getTime()
            "reply_to": message.payload.meeting_id + "/" + message.payload.userid
            "name": "get_chat_history"
          }
        }

        @pubClient.publish(config.redis.channels.toBBBApps.chat, JSON.stringify(getChatHistory))
        console.log "just published the getChatHistory in RedisPubSub"


    else if message.header?.name is 'get_users_reply'
      console.log 'got a reply from bbb-apps for get users'
      sendToController(message)

    else if message.header?.name is 'get_chat_history_reply'
      console.log 'got a reply from bbb-apps for chat history'
      sendToController(message)

    else if message.header?.name is 'send_public_chat_message'
      console.log "just got a public chat message :" + JSON.stringify message
      sendToController (message)

  publishing: (channel, message) =>
    console.log '\n Publishing\n'
    @pubClient.publish(channel, JSON.stringify(message))

sendToController = (message) ->
  postal.publish
    channel: config.redis.internalChannels.receive
    topic: "broadcast"
    data: message

