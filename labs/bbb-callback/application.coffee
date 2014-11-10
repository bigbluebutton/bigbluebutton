request = require("request")
redis = require("redis")

config = require("./config")
Callbacks = require("./callbacks")

# Class that defines the application.
module.exports = class Application

  constructor: ->
    @subscriber = redis.createClient()
    @callbacks = new Callbacks()

  start: ->
    @_subscribe()

  _subscribe: ->

    @subscriber.on "psubscribe", (channel, count) ->
      console.log "Application: subscribed to " + channel

    @subscriber.on "pmessage", (pattern, channel, message) =>
      console.log "---------------------------------------------------------"
      console.log "Application: got message [", channel, "]", message
      try
        message = JSON.parse message
        if message? and @_filterMessage channel, message
          @_processMessage message

      catch e
        # TODO: handle the error properly
        console.log e

    @subscriber.psubscribe "bigbluebutton:*"

  # Returns whether the message read from redis should generate a callback
  # call or not.
  _filterMessage: (channel, message) ->
    for event in config.events
      if channel? and message.header?.name? and
         event.channel.match(channel) and event.name.match(message.header?.name)
          return true
    false

  _processMessage: (message) ->
    @callbacks.getCallbackUrls (error, callbackUrls) =>
      console.log "Application: got callback urls:", callbackUrls
      callbackUrls.forEach (callbackUrl) ->
        if callbackUrl.isActive()
          callbackUrl.enqueue(message)
