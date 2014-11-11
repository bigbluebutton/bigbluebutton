request = require("request")
redis = require("redis")

config = require("./config")
Callbacks = require("./callbacks")

# Class that defines the application. Listens for events on redis and starts the
# process to perform the callback calls.
module.exports = class Application

  constructor: ->
    @subscriber = redis.createClient()
    @callbacks = new Callbacks()

  start: ->

    @subscriber.on "psubscribe", (channel, count) ->
      console.log "Application: subscribed to " + channel

    @subscriber.on "pmessage", (pattern, channel, message) =>
      try
        message = JSON.parse message
        if message? and @_filterMessage channel, message
          console.log "\n"
          console.log "Application: processing message [#{channel}]", message
          @_processEvent message

      catch e
        console.log "Application: error processing the message", message, ":", e

    @subscriber.psubscribe "bigbluebutton:*"

  # Returns whether the message read from redis should generate a callback
  # call or not.
  _filterMessage: (channel, message) ->
    for event in config.events
      if channel? and message.header?.name? and
         event.channel.match(channel) and event.name.match(message.header?.name)
          return true
    false

  # Processes an event received from redis. Will get all callback URLs that
  # should receive this event and start the process to perform the callback.
  _processEvent: (message) ->
    @callbacks.getCallbackUrls (error, callbackUrls) =>
      console.log "Application: got callback urls:", callbackUrls
      callbackUrls.forEach (callbackUrl) ->
        if callbackUrl.isActive()
          callbackUrl.enqueue(message)
