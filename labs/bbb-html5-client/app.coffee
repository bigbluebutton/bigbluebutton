# Module dependencies
express = require("express")
RedisStore = require("connect-redis")(express)
redis = require("redis")

config = require("./config")
Logger = require("./lib/logger")
MainRouter = require("./routes/main_router")
Modules = require("./lib/modules")
RedisAction = require("./lib/redis_action")
RedisBridge = require("./lib/redis_bridge")
Utils = require("./lib/utils")
WebsocketConnection = require("./lib/websocket_connection")


# Module to store the modules registered in the application
config.modules = modules = new Modules()

# TODO: there's a lot of objects to deal with redis, it would probably be a lot better to have just
#   one object that uses the others internally, so only one would be a global module, the rest can
#   be local instance variables.
config.modules.register "RedisAction", new RedisAction()
config.modules.register "RedisStore", redis.createClient()
config.modules.register "RedisPublisher", redis.createClient()

# The application, exported in this module
app = config.modules.register "App", express.createServer()
module.exports = app

# configure the application
app.configure ->
  app.set "views", __dirname + "/views"
  app.set "view engine", "jade"
  app.use express["static"](__dirname + "/public")
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
    redisAction.isValidSession meetingID, sessionID, (isValid) ->
      unless isValid
        Logger.error "Invalid sessionID/meetingID"
        callback(null, false) # failed authorization
      else
        redisAction.getUserProperties meetingID, sessionID, (properties) ->
          handshakeData.sessionID = sessionID
          handshakeData.username = properties.username
          handshakeData.meetingID = properties.meetingID
          callback(null, true) # good authorization

# WebsocketConnection instance used to talk to all clients connected via websocket.
config.modules.register "WebsocketConnection", new WebsocketConnection(io)

config.modules.register "RedisBridge", new RedisBridge(io)
