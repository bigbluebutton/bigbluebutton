# Module dependencies
express = require("express")
RedisStore = require("connect-redis")(express)
redis = require("redis")

config = require("./config")
MainRouter = require("./routes/main_router")
RedisAction = require("./lib/redis_action")
RedisBridge = require("./lib/redis_bridge")
RedisKeys = require("./lib/redis_keys")
Utils = require("./lib/utils")
WebsocketConnection = require("./lib/websocket_connection")

# global variables
config.redisAction = new RedisAction()

# the application, exported in this module
config.app.server = app = module.exports = express.createServer()

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
config.mainRouter = new MainRouter(app)

# Socket.IO
io = require("socket.io").listen(app)
io.configure ->
  # Authorize a session before it given access to connect to SocketIO
  io.set "authorization", (handshakeData, callback) ->
    sessionID = Utils.getCookieVar(handshakeData.headers.cookie, "sessionid")
    meetingID = Utils.getCookieVar(handshakeData.headers.cookie, "meetingid")
    config.redisAction.isValidSession meetingID, sessionID, (isValid) ->
      unless isValid
        console.log "Invalid sessionID/meetingID"
        callback(null, false) # failed authorization
      else
        config.redisAction.getUserProperties meetingID, sessionID, (properties) ->
          handshakeData.sessionID = sessionID
          handshakeData.username = properties.username
          handshakeData.meetingID = properties.meetingID
          callback(null, true) # good authorization


config.socketAction = new WebsocketConnection(io)

config.redisBridge =  new RedisBridge(io)
