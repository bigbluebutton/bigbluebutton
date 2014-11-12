EventEmitter = require('events').EventEmitter
request = require("request")

config = require("./config")
Utils = require("./utils")

# Class that emits a callback. Will try several times until the callback is
# properly emitted and stop when successful (or after a given number of tries).
# Emits "success" on success and "error" when gave up trying to emit the callback.
module.exports = class CallbackEmitter extends EventEmitter

  constructor: (@callbackURL, @message) ->

  start: ->
    @_scheduleNext 0

  _scheduleNext: (timeout) ->
    setTimeout( =>
      @_emitMessage (error, result) =>
        # TODO: treat error
        if result
          @emit "success"
        else
          # TODO: increase the timeout periodically and stop at some point, emitting "error"
          @_scheduleNext 1000
    , timeout)

  _emitMessage: (callback) ->
    # basic data structure
    data =
      timestamp: new Date().getTime()
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
        console.log "X=> Error in the callback call to: [#{requestOptions.uri}] for #{simplifiedEvent(data.event)}"
        console.log "Error:", error
        console.log "Response:", response
        callback error, false
      else
        console.log "==> Successful callback call to: [#{requestOptions.uri}] for #{simplifiedEvent(data.event)}"
        callback null, true

# A simple string that identifies the event
simplifiedEvent = (event) ->
  "event: { name: #{event.header?.name}, timestamp: #{event.header?.timestamp} }"
