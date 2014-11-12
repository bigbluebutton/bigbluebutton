EventEmitter = require('events').EventEmitter
request = require("request")

config = require("./config")
Utils = require("./utils")

# Use to perform a callback. Will try several times until the callback is
# properly emitted and stop when successful (or after a given number of tries).
# Used to emit a single callback. Destroy it and create a new class for a new callback.
# Emits "success" on success, "failure" on error and "stopped" when gave up trying
# to perform the callback.
module.exports = class CallbackEmitter extends EventEmitter

  constructor: (@callbackURL, @message) ->
    @nextInterval = 0
    @timestap = 0

  start: ->
    @timestap = new Date().getTime()
    @nextInterval = 0
    @_scheduleNext 0

  _scheduleNext: (timeout) ->
    setTimeout( =>
      @_emitMessage (error, result) =>
        if not error? and result
          @emit "success"
        else
          @emit "failure", error

          # get the next interval we have to wait and schedule a new try
          interval = config.hooks.retryIntervals[@nextInterval]
          if interval?
            console.log "xx> Trying the callback again in #{interval/1000.0} secs"
            @nextInterval++
            @_scheduleNext(interval)

          # no intervals anymore, time to give up
          else
            @nextInterval = 0
            @emit "stopped"

    , timeout)

  _emitMessage: (callback) ->
    # basic data structure
    data =
      timestamp: @timestamp
      event: @message

    # add a checksum to the post data
    checksum = Utils.checksum("#{@callbackURL}#{JSON.stringify(data)}#{config.bbb.sharedSecret}")
    data.checksum = checksum

    requestOptions =
      uri: @callbackURL
      method: "POST"
      json: data

    request requestOptions, (error, response, body) ->
      if error?
        console.log "xx> Error in the callback call to: [#{requestOptions.uri}] for #{simplifiedEvent(data.event)}"
        console.log "xx> Error:", error
        # console.log "xx> Response:", response
        callback error, false
      else
        console.log "==> Successful callback call to: [#{requestOptions.uri}] for #{simplifiedEvent(data.event)}"
        callback null, true

# A simple string that identifies the event
simplifiedEvent = (event) ->
  "event: { name: #{event.header?.name}, timestamp: #{event.header?.timestamp} }"
