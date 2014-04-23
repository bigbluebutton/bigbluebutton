redis = require 'redis'
crypto = require 'crypto'
postal = require 'postal'

config = require '../config'
log = require './bbblogger'

# default timeout to wait for response
TIMEOUT = 5000

module.exports = class RedisPubSub

  constructor: ->
    @pubClient = redis.createClient()
    @subClient = redis.createClient()

    # hash to store requests waiting for response
    @pendingRequests = {}

    postal.subscribe
      channel: config.redis.internalChannels.publish
      topic: 'broadcast'
      callback: (msg, envelope) ->
        if envelope.replyTo?
          sendAndWaitForReply(msg, envelope)
        else
          sendMessage(msg, envelope)

    @subClient.on "subscribe", (channel, count) ->
      log.info("Subscribed to #{channel}")

    @subClient.on "message", (channel, jsonMsg) ->
      log.debug("Received message on [channel] = #{channel} [message] = #{jsonMsg}")
      message = JSON.parse(jsonMsg)

      if message.header?.correlationId?
        correlationId = message.header.correlationId
        # retrieve the request entry
        entry = @pendingRequests[correlationId]
        # make sure we don't timeout by clearing it
        clearTimeout(entry.timeout)
        # delete the entry from hash
        delete @pendingRequests[correlationId]
        response = {}
        response.data = message.payload
        postal.publish
          channel: entry.replyTo.channel
          topic: entry.replyTo.topic
          data: response
      else
        sendToController message

    log.info("RPC: Subscribing message on channel [#{config.redis.channels.fromBBBApps}]")
    @subClient.subscribe(config.redis.channels.fromBBBApps)

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
    , TIMEOUT, correlationId)

    # create a request entry to store in a hash
    entry =
      replyTo: envelope.replyTo
      timeout: timeoutId #the id for the timeout so we can clear it

    # put the entry in the hash so we can match the response later
    @pendingRequests[correlationId] = entry
    message.header.correlationId = correlationId

    log.info("Publishing #{message}")
    @pubClient.publish(config.redis.channels.toBBBApps, JSON.stringify(message))

sendToController = (message) ->
  postal.publish
    channel: config.redis.internalChannels.receive
    topic: "broadcast"
    data: message
