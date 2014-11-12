express = require("express")
url = require("url")

config = require("./config")
Hook = require("./hook")
Utils = require("./utils")

# Web server that listens for API calls and process them.
module.exports = class WebServer

  constructor: ->
    @app = express()
    @_registerRoutes()

  start: (port) ->
    @server = @app.listen(port)
    unless @server.address()?
      console.log "Could not bind to port", port
      console.log "Aborting."
      process.exit(1)
    console.log "== Server listening on port", port, "in", @app.settings.env.toUpperCase(), "mode"

  _registerRoutes: ->
    # Request logger
    @app.all "*", (req, res, next) ->
      console.log "<==", req.method, "request to", req.url, "from:", clientDataSimple(req)
      next()

    @app.get "/bigbluebutton/api/hooks/subscribe", @_validateChecksum, @_subscribe
    @app.get "/bigbluebutton/api/hooks/unsubscribe", @_validateChecksum, @_unsubscribe
    @app.get "/bigbluebutton/api/hooks/list", @_validateChecksum, @_list

  _subscribe: (req, res, next) ->
    urlObj = url.parse(req.url, true)
    callbackURL = urlObj.query["callbackURL"]
    meetingID = urlObj.query["meetingID"]

    # TODO: if meetingID is set in the url, check if the meeting exists, otherwise
    #   invalid("invalidMeetingIdentifier", "The meeting ID that you supplied did not match any existing meetings");

    unless callbackURL?
      respondWithXML(res, config.api.responses.missingParamCallbackURL)
    else
      Hook.addSubscription callbackURL, meetingID, (error, hook) ->
        if error? # the only error for now is for duplicated callbackURL
          msg = config.api.responses.subscribeDuplicated(hook.id)
        else if hook?
          msg = config.api.responses.subscribeSuccess(hook.id)
        else
          msg = config.api.responses.subscribeFailure
        respondWithXML(res, msg)

  _unsubscribe: (req, res, next) ->
    urlObj = url.parse(req.url, true)
    subscriptionID = urlObj.query["subscriptionID"]

    unless subscriptionID?
      respondWithXML(res, config.api.responses.missingParamSubscriptionID)
    else
      Hook.removeSubscription subscriptionID, (error, result) ->
        if error?
          msg = config.api.responses.unsubscribeFailure
        else if !result
          msg = config.api.responses.unsubscribeNoSubscription
        else
          msg = config.api.responses.unsubscribeSuccess
        respondWithXML(res, msg)

  _list: (req, res, next) ->
    # TODO: implement
    res.send "Listing subscriptions!"

  # Validates the checksum in the request `req`.
  # If it doesn't match BigBlueButton's shared secret, will send an XML response
  # with an error code just like BBB does.
  _validateChecksum: (req, res, next) =>
    urlObj = url.parse(req.url, true)
    checksum = urlObj.query["checksum"]

    if checksum is Utils.checksumAPI(req.url, config.bbb.sharedSecret)
      next()
    else
      console.log "checksum check failed, sending a checksumError response"
      res.setHeader("Content-Type", "text/xml")
      res.send cleanupXML(config.api.responses.checksumError)

respondWithXML = (res, msg) ->
  res.setHeader("Content-Type", "text/xml")
  res.send cleanupXML(msg)

# Returns a simple string with a description of the client that made
# the request. It includes the IP address and the user agent.
clientDataSimple = (req) ->
  "ip " + Utils.ipFromRequest(req) + ", using " + req.headers["user-agent"]

# Cleans up a string with an XML in it removing spaces and new lines from between the tags.
cleanupXML = (string) ->
  string.trim().replace(/>\s*/g, '>')
