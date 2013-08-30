# Module dependencies
express = require("express")
RedisStore = require("connect-redis")(express)
redis = require("redis")

config = require("./config")
MainRouter = require("./routes/main_router")
RedisAction = require("./lib/redis_action")
RedisKeys = require("./lib/redis_keys")
WebsocketConnection = require("./lib/websocket_connection")

# global variables
config.redisAction = new RedisAction()
config.store = redis.createClient() # TODO:
config.redis.pub = redis.createClient() # TODO:
config.redis.sub = redis.createClient() # TODO:
subscriptions = ["*"]
config.redis.sub.psubscribe.apply(config.redis.sub, subscriptions)

# the application, exported in this module
config.app = app = module.exports = express.createServer()

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

# Router
config.mainRouter = new MainRouter(app)

# Socket.IO Routes

io = require("socket.io").listen(app)

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
    config.redisAction.isValidSession meetingID, sessionID, (isValid) ->
      unless isValid
        console.log "Invalid sessionID/meetingID"
        callback null, false # failed authorization
      else
        config.redisAction.getUserProperties meetingID, sessionID, (properties) ->
          handshakeData.sessionID = sessionID
          handshakeData.username = properties.username
          handshakeData.meetingID = properties.meetingID
          callback null, true # good authorization

config.socketAction = new WebsocketConnection(io)

# Redis Routes
###
When Redis Sub gets a message from Pub
@param  {String} pattern Matched pattern on Redis PubSub
@param  {String} channel Channel the pmessage was published on (socket room)
@param  {String} message Message published (socket message data)
@return {undefined}
TODO: why is this here?
###
config.redis.sub.on "pmessage", (pattern, channel, message) ->

  if channel is "bigbluebutton:bridge"
    console.log message
    attributes = JSON.parse(message)

    # In order to send 'changeslide' event to get the current slide url after user join,
    # I manually save the current presentation slide url to redis key: 'currentUrl' for future use.
    # This key will be used in socketio.js file line 276
    if attributes[1] is "changeslide"
      url = attributes[2]
      config.store.set "currentUrl", url, (err, reply) ->
        console.log "REDIS: Set current page url to " + url  if reply
        console.log "REDIS ERROR: Couldn't set current pageurl to " + url  if err


    # When presenter in flex side sends the 'undo' event, remove the current shape from Redis
    # and publish the rest shapes to html5 users
    if attributes[1] is "undo"
      meetingID = attributes[0]
      config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
        config.redisAction.getCurrentPageID meetingID, presentationID, (pageID) ->
          config.store.rpop RedisKeys.getCurrentShapesString(meetingID, presentationID, pageID), (err, reply) ->
            config.socketAction.publishShapes meetingID

    # When presenter in flex side sends the 'clrPaper' event, remove everything from Redis
    if attributes[1] is "clrPaper"
      meetingID = attributes[0]
      config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
        config.redisAction.getCurrentPageID meetingID, presentationID, (pageID) ->
          config.redisAction.getItemIDs meetingID, presentationID, pageID, "currentshapes", (meetingID, presentationID, pageID, itemIDs, itemName) ->
            config.redisAction.deleteItemList meetingID, presentationID, pageID, itemName, itemIDs

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
      config.redis.pub.publish meetingID, JSON.stringify(["clrPaper"])
      config.socketAction.publishSlides meetingID, null, ->
        config.socketAction.publishViewBox meetingID
        config.redis.pub.publish meetingID, JSON.stringify(["uploadStatus", "Upload succeeded", true])

  else
    # value of pub channel is used as the name of the SocketIO room to send to.
    channel_viewers = io.sockets.in(channel)

    # apply the parameters to the socket event, and emit it on the channels
    channel_viewers.emit.apply channel_viewers, JSON.parse(message)
