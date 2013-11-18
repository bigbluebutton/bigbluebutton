# Module dependencies
express = require("express")
RedisStore = require("connect-redis")(express)
redis = require("redis")

config = require("./config")
Logger = require("./lib/logger")
MainRouter = require("./routes/main_router")
Modules = require("./lib/modules")
RedisAction = require("./lib/redis_action")
RedisPublisher = require("./lib/redis_publisher")
RedisWebsocketBridge = require("./lib/redis_websocket_bridge")
Utils = require("./lib/utils")

# Module to store the modules registered in the application
config.modules = modules = new Modules()

config.modules.register "RedisAction", new RedisAction()
config.modules.register "RedisPublisher", new RedisPublisher()

# @todo This is only as a module because this app still changes data on redis, but it shouldn't.
#   When this is fixed, redisStore can probably become an internal variable in RedisAction.
config.modules.register "RedisStore", redis.createClient()

# The application, exported in this module
app = config.modules.register "App", express.createServer()
module.exports = app

# configure the application
app.configure ->
  app.set "views", __dirname + "/views"
  app.set "view engine", "jade"
  app.use express["static"](__dirname + "/public")
  app.use require('connect-assets')()
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.cookieParser()

  # redis
  app.use express.session(
    secret: config.app.sessionSecret
    cookie:
      secure: true
    store: new RedisStore(
      host: config.redis.host
      port: config.redis.port
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

# view helpers
app.helpers
  h_environment: app.settings.env

# Router
config.modules.register "MainRouter", new MainRouter()

# Socket.IO
io = require("socket.io").listen(app)
io.configure ->

  # Authorize a session before it given access to connect to SocketIO
  io.set "authorization", (handshakeData, callback) ->
    redisAction = config.modules.get("RedisAction")
    sessionID = Utils.getCookieVar(handshakeData.headers.cookie, "sessionid")
    meetingID = Utils.getCookieVar(handshakeData.headers.cookie, "meetingid")
    redisAction.isValidSession meetingID, sessionID, (err, isValid) ->
      unless isValid
        Logger.error "Invalid sessionID/meetingID"
        callback(null, false) # failed authorization
      else
        redisAction.getUserProperties meetingID, sessionID, (err, properties) ->
          handshakeData.sessionID = sessionID
          handshakeData.username = properties.username
          handshakeData.meetingID = properties.meetingID
          callback(null, true) # good authorization

# Bridge used to interact between redis and socket clients
config.modules.register "RedisWebsocketBridge", new RedisWebsocketBridge(io)

# reduce logging
io.set('log level', 1);
