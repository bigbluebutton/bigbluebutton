express = require("express")
sha1 = require("sha1")
url = require("url")

config = require("./config")

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
    console.log "*** Server listening on port", port, "in", @app.settings.env.toUpperCase(), "mode"

  _registerRoutes: ->
    # Request logger
    @app.all "*", (req, res, next) ->
      console.log "*", req.method, "request to", req.url, "from:", clientDataSimple(req)
      next()

    @app.get "/bigbluebutton/api/hooks/subscribe", @_validateChecksum, @_subscribe
    @app.get "/bigbluebutton/api/hooks/unsubscribe", @_validateChecksum, @_unsubscribe
    @app.get "/bigbluebutton/api/hooks/list", @_validateChecksum, @_list

  _subscribe: (req, res, next) ->
    res.send "Subscribed!"

  _unsubscribe: (req, res, next) ->
    res.send "Unsubscribed!"

  _list: (req, res, next) ->
    res.send "Listing subscriptions!"

  # Validates the checksum in the request `req`.
  # If it doesn't match BigBlueButton's shared secret, will send an XML response
  # with an error code just like BBB does.
  _validateChecksum: (req, res, next) =>
    urlObj = url.parse(req.url, true)
    checksum = urlObj.query["checksum"]

    if checksum is @_checksum(req.url, config.bbb.sharedSecret)
      next()
    else
      console.log "checksum check failed, sending a checksumError response"
      res.setHeader("Content-Type", "text/xml")
      res.send(config.bbb.responses.checksumError)

  # Calculates the checksum given a url `fullUrl` and a `salt`.
  _checksum: (fullUrl, salt) ->
    query = @_queryFromUrl(fullUrl)
    method = @_methodFromUrl(fullUrl)
    sha1(method + query + salt)

  # Get the query of an API call from the url object (from url.parse())
  # Example:
  #
  # * `fullUrl` = `http://bigbluebutton.org/bigbluebutton/api/create?name=Demo+Meeting&meetingID=Demo`
  # * returns: `name=Demo+Meeting&meetingID=Demo`
  _queryFromUrl: (fullUrl) ->

    # Returns the query without the checksum.
    # We can't use url.parse() because it would change the encoding
    # and the checksum wouldn't match. We need the url exactly as
    # the client sent us.
    query = fullUrl.replace(/&checksum=[^&]*/, '')
    query = query.replace(/checksum=[^&]*&/, '')
    query = query.replace(/checksum=[^&]*$/, '')
    matched = query.match(/\?(.*)/)
    if matched?
      matched[1]
    else
      ''

  # Get the method name of an API call from the url object (from url.parse())
  # Example:
  #
  # * `fullUrl` = `http://mconf.org/bigbluebutton/api/create?name=Demo+Meeting&meetingID=Demo`
  # * returns: `create`
  _methodFromUrl: (fullUrl) ->
    urlObj = url.parse(fullUrl, true)
    urlObj.pathname.substr (config.bbb.apiPath + "/").length

# Returns a simple string with a description of the client that made
# the request. It includes the IP address and the user agent.
clientDataSimple = (req) ->
  "ip " + ipFromRequest(req) + ", using " + req.headers["user-agent"]

# Returns the IP address of the client that made a request `req`.
# If can not determine the IP, returns `127.0.0.1`.
ipFromRequest = (req) ->

  # the first ip in the list if the ip of the client
  # the others are proxys between him and us
  if req.headers?["x-forwarded-for"]?
    ips = req.headers["x-forwarded-for"].split(",")
    ipAddress = ips[0]?.trim()

  # fallbacks
  ipAddress ||= req.headers?["x-real-ip"] # when behind nginx
  ipAddress ||= req.connection?.remoteAddress
  ipAddress ||= "127.0.0.1"
  ipAddress
