# default global variables
max_chat_length = 140
max_username_length = 30
max_meetingid_length = 10
maxImage = 3

# Module dependencies
express = require("express")
io = require("socket.io").listen(app)
RedisStore = require("connect-redis")(express)
redis = require("redis")
routes = require("./routes")
hat = require("hat")
rack = hat.rack()
format = require("util").format
fs = require("fs")
im = require("imagemagick")
util = require("util")
exec = require("child_process").exec
ip_address = "localhost"

# global variables
redisAction = require("./redis")
socketAction = require("./routes/socketio")
sanitizer = require("sanitizer")
store = redis.createClient()

# store.flushdb();
pub = redis.createClient()
sub = redis.createClient()
subscriptions = ["*"]
sub.psubscribe.apply sub, subscriptions

# the application, exported in this module
app = module.exports = express.createServer()

# Configuration
app.configure ->
  app.set "views", __dirname + "/views"
  app.set "view engine", "jade"
  app.use express["static"](__dirname + "/public")
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.cookieParser()

  # redis
  app.use express.session(
    secret: "password"
    cookie:
      secure: true

    store: new RedisStore(
      host: "127.0.0.1"
      port: "6379"
    )
    key: "express.sid"
  )
  app.use app.router

app.configure "development", ->
  app.use express.errorHandler(
    dumpExceptions: true
    showStack: true
  )

app.configure "production", ->
  app.use express.errorHandler()

app.helpers
  h_environment: app.settings.env

###
If a page requires authentication to view, this
function is used to verify they are logged in.
@param  {Object}   req   Request object from client
@param  {Object}   res   Response object to client
@param  {Function} next  To be run as a callback if valid
@return {undefined}      Response object is used to send data back to the client
###
requiresLogin = (req, res, next) ->

  # check that they have a cookie with valid session id
  redisAction.isValidSession req.cookies["meetingid"], req.cookies["sessionid"], (isValid) ->
    if isValid
      next()
    else
      res.redirect "/"

# Routes (see /routes/index.js)
app.get "/", routes.get_index
app.get "/auth", routes.get_auth
app.post "/auth", routes.post_auth
app.post "/logout", requiresLogin, routes.logout
app.get "/join", routes.join
app.post "/upload", requiresLogin, routes.post_upload
app.get "/meetings", routes.meetings

# --- 404 (keep as last route) --- //
app.get "*", routes.error404
app.post "*", routes.error404

# Socket.IO Routes

###
This function is used to parse a variable value from a cookie string.
@param  {String} cookie_string The cookie to parse.
@param  {String} c_var         The variable to extract from the cookie.
@return {String} The value of the variable extracted.
###
getCookie = (cookie_string, c_var) ->
  if cookie_string
    ARRcookies = cookie_string.split(";")
    i = 0
    while i < ARRcookies.length
      x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="))
      y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1)
      x = x.replace(/^\s+|\s+$/g, "")
      return unescape(y) if x is c_var
      i++
  else
    console.log "Invalid cookie"
    ""

###
Authorize a session before it given access to connect to SocketIO
###
io.configure ->
  io.set "authorization", (handshakeData, callback) ->
    sessionID = getCookie(handshakeData.headers.cookie, "sessionid")
    meetingID = getCookie(handshakeData.headers.cookie, "meetingid")
    redisAction.isValidSession meetingID, sessionID, (isValid) ->
      unless isValid
        console.log "Invalid sessionID/meetingID"
        callback null, false # failed authorization
      else
        redisAction.getUserProperties meetingID, sessionID, (properties) ->
          handshakeData.sessionID = sessionID
          handshakeData.username = properties.username
          handshakeData.meetingID = properties.meetingID
          callback null, true # good authorization

# When someone connects to the websocket. Includes all the SocketIO events.
io.sockets.on "connection", socketAction.SocketOnConnection

# Redis Routes
###
When Redis Sub gets a message from Pub
@param  {String} pattern Matched pattern on Redis PubSub
@param  {String} channel Channel the pmessage was published on (socket room)
@param  {String} message Message published (socket message data)
@return {undefined}
###
sub.on "pmessage", (pattern, channel, message) ->

  if channel is "bigbluebutton:bridge"
    console.log message
    attributes = JSON.parse(message)

    # In order to send 'changeslide' event to get the current slide url after user join,
    # I manually save the current presentation slide url to redis key: 'currentUrl' for future use.
    # This key will be used in socketio.js file line 276
    if attributes[1] is "changeslide"
      url = attributes[2]
      store.set "currentUrl", url, (err, reply) ->
        console.log "REDIS: Set current page url to " + url  if reply
        console.log "REDIS ERROR: Couldn't set current pageurl to " + url  if err


    # When presenter in flex side sends the 'undo' event, remove the current shape from Redis
    # and publish the rest shapes to html5 users
    if attributes[1] is "undo"
      meetingID = attributes[0]
      redisAction.getCurrentPresentationID meetingID, (presentationID) ->
        redisAction.getCurrentPageID meetingID, presentationID, (pageID) ->
          store.rpop redisAction.getCurrentShapesString(meetingID, presentationID, pageID), (err, reply) ->
            socketAction.publishShapes meetingID

    # When presenter in flex side sends the 'clrPaper' event, remove everything from Redis
    if attributes[1] is "clrPaper"
      meetingID = attributes[0]
      redisAction.getCurrentPresentationID meetingID, (presentationID) ->
        redisAction.getCurrentPageID meetingID, presentationID, (pageID) ->
          redisAction.getItemIDs meetingID, presentationID, pageID, "currentshapes", (meetingID, presentationID, pageID, itemIDs, itemName) ->
            redisAction.deleteItemList meetingID, presentationID, pageID, itemName, itemIDs

    channel_viewers = io.sockets.in(attributes[0])
    attributes.splice 0, 1
    # var only_values = [];
    # only_values.push(attributes.messageName);
    # only_values.push(attributes.params);

    # apply the parameters to the socket event, and emit it on the channels
    channel_viewers.emit.apply channel_viewers, attributes

  else if channel is "bigbluebutton:meeting:presentation"
    attributes = JSON.parse(message)
    if attributes.messageKey is "CONVERSION_COMPLETED"
      meetingID = attributes.room
      pub.publish meetingID, JSON.stringify(["clrPaper"])
      socketAction.publishSlides meetingID, null, ->
        socketAction.publishViewBox meetingID
        pub.publish meetingID, JSON.stringify(["uploadStatus", "Upload succeeded", true])

  else
    # value of pub channel is used as the name of the SocketIO room to send to.
    channel_viewers = io.sockets.in(channel)

    # apply the parameters to the socket event, and emit it on the channels
    channel_viewers.emit.apply channel_viewers, JSON.parse(message)
