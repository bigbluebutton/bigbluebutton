request = require("request")
redis = require("redis")

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
        message = JSON.parse(message)

        # TODO: filter the messages we want to process
        @_processMessage(message) if message?

      catch e
        # TODO: handle the error properly
        console.log e

    @subscriber.psubscribe "bigbluebutton:*"

  _processMessage: (message) ->
    @callbacks.getCallbackUrls (error, callbackUrls) =>
      console.log "Application: got callback urls:", callbackUrls
      callbackUrls.forEach (callbackUrl) ->
        if callbackUrl.isActive()
          # TODO: the external meeting ID is not on redis yet
          # message.meetingID = rep.externalMeetingID
          callbackUrl.enqueue(message)
