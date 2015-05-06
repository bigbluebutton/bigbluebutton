_ = require('lodash')
request = require("request")
url = require('url')
EventEmitter = require('events').EventEmitter

config = require("./config")
Logger = require("./logger")
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
    @timestamp = new Date().getTime()
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
            Logger.warn "xx> Trying the callback again in #{interval/1000.0} secs"
            @nextInterval++
            @_scheduleNext(interval)

          # no intervals anymore, time to give up
          else
            @nextInterval = 0
            @emit "stopped"

    , timeout)

  _emitMessage: (callback) ->
    # data to be sent
    # note: keep keys in alphabetical order
    data =
      event: JSON.stringify(@message)
      timestamp: @timestamp

    # calculate the checksum
    checksum = Utils.checksum("#{@callbackURL}#{JSON.stringify(data)}#{config.bbb.sharedSecret}")

    # get the final callback URL, including the checksum
    urlObj = url.parse(@callbackURL, true)
    callbackURL = @callbackURL
    callbackURL += if _.isEmpty(urlObj.search) then "?" else "&"
    callbackURL += "checksum=#{checksum}"

    requestOptions =
      followRedirect: true
      maxRedirects: 10
      uri: callbackURL
      method: "POST"
      form: data

    request requestOptions, (error, response, body) ->
      if error? or not (response?.statusCode >= 200 and response?.statusCode < 300)
        Logger.warn "xx> Error in the callback call to: [#{requestOptions.uri}] for #{simplifiedEvent(data.event)}"
        Logger.warn "xx> Error:", error
        Logger.warn "xx> Status:", response?.statusCode
        callback error, false
      else
        Logger.info "==> Successful callback call to: [#{requestOptions.uri}] for #{simplifiedEvent(data.event)}"
        callback null, true

# A simple string that identifies the event
simplifiedEvent = (event) ->
  try
    eventJs = JSON.parse(event)
    "event: { name: #{eventJs.header?.name}, timestamp: #{eventJs.header?.timestamp} }"
  catch e
    "event: #{event}"
