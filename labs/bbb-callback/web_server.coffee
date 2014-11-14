_ = require("lodash")
express = require("express")
url = require("url")

config = require("./config")
Hook = require("./hook")
Logger = require("./logger")
Utils = require("./utils")

# Web server that listens for API calls and process them.
module.exports = class WebServer

  constructor: ->
    @app = express()
    @_registerRoutes()

  start: (port) ->
    @server = @app.listen(port)
    unless @server.address()?
      Logger.error "Could not bind to port", port
      Logger.error "Aborting."
      process.exit(1)
    Logger.info "Server listening on port", port, "in", @app.settings.env.toUpperCase(), "mode"

  _registerRoutes: ->
    # Request logger
    @app.all "*", (req, res, next) ->
      unless fromMonit(req)
        Logger.info "<==", req.method, "request to", req.url, "from:", clientDataSimple(req)
      next()

    @app.get "/bigbluebutton/api/hooks/create", @_validateChecksum, @_create
    @app.get "/bigbluebutton/api/hooks/destroy", @_validateChecksum, @_destroy
    @app.get "/bigbluebutton/api/hooks/list", @_validateChecksum, @_list
    @app.get "/bigbluebutton/api/hooks/ping", (req, res) ->
      res.write "bbb-webhooks up!"
      res.end()

  _create: (req, res, next) ->
    urlObj = url.parse(req.url, true)
    callbackURL = urlObj.query["callbackURL"]
    meetingID = urlObj.query["meetingID"]

    unless callbackURL?
      respondWithXML(res, config.api.responses.missingParamCallbackURL)
    else
      Hook.addSubscription callbackURL, meetingID, (error, hook) ->
        if error? # the only error for now is for duplicated callbackURL
          msg = config.api.responses.createDuplicated(hook.id)
        else if hook?
          msg = config.api.responses.createSuccess(hook.id)
        else
          msg = config.api.responses.createFailure
        respondWithXML(res, msg)

  _destroy: (req, res, next) ->
    urlObj = url.parse(req.url, true)
    hookID = urlObj.query["hookID"]

    unless hookID?
      respondWithXML(res, config.api.responses.missingParamHookID)
    else
      Hook.removeSubscription hookID, (error, result) ->
        if error?
          msg = config.api.responses.destroyFailure
        else if !result
          msg = config.api.responses.destroyNoHook
        else
          msg = config.api.responses.destroySuccess
        respondWithXML(res, msg)

  _list: (req, res, next) ->
    urlObj = url.parse(req.url, true)
    meetingID = urlObj.query["meetingID"]

    if meetingID?
      # all the hooks that receive events from this meeting
      hooks = Hook.allGlobalSync()
      hooks = hooks.concat(Hook.findByExternalMeetingIDSync(meetingID))
      hooks = _.sortBy(hooks, (hook) -> hook.id)
    else
      # no meetingID, return all hooks
      hooks = Hook.allSync()

    msg = "<response><returncode>SUCCESS</returncode><hooks>"
    hooks.forEach (hook) ->
      msg += "<hook>"
      msg +=   "<hookID>#{hook.id}</hookID>"
      msg +=   "<callbackURL><![CDATA[#{hook.callbackURL}]]></callbackURL>"
      msg +=   "<meetingID><![CDATA[#{hook.externalMeetingID}]]></meetingID>" unless hook.isGlobal()
      msg += "</hook>"
    msg += "</hooks></response>"

    respondWithXML(res, msg)

  # Validates the checksum in the request `req`.
  # If it doesn't match BigBlueButton's shared secret, will send an XML response
  # with an error code just like BBB does.
  _validateChecksum: (req, res, next) =>
    urlObj = url.parse(req.url, true)
    checksum = urlObj.query["checksum"]

    if checksum is Utils.checksumAPI(req.url, config.bbb.sharedSecret)
      next()
    else
      Logger.info "checksum check failed, sending a checksumError response"
      res.setHeader("Content-Type", "text/xml")
      res.send cleanupXML(config.api.responses.checksumError)

respondWithXML = (res, msg) ->
  msg = cleanupXML(msg)
  Logger.info "==> respond with:", msg
  res.setHeader("Content-Type", "text/xml")
  res.send msg

# Returns a simple string with a description of the client that made
# the request. It includes the IP address and the user agent.
clientDataSimple = (req) ->
  "ip " + Utils.ipFromRequest(req) + ", using " + req.headers["user-agent"]

# Cleans up a string with an XML in it removing spaces and new lines from between the tags.
cleanupXML = (string) ->
  string.trim().replace(/>\s*/g, '>')

# Was this request made by monit?
fromMonit = (req) ->
  req.headers["user-agent"]? and req.headers["user-agent"].match(/^monit/)
