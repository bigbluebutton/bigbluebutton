# Module dependencies
express     = require("express")
redis       = require("redis")
RedisStore  = require("connect-redis")(express)

config      = require("./config")
ClientProxy = require("./lib/clientproxy")
Controller  = require("./lib/controller")
Logger      = require("./lib/logger")
MainRouter  = require("./routes/main_router")
MessageBus  = require("./lib/messagebus")
Modules     = require("./lib/modules")
RedisPubSub = require("./lib/redispubsub")
Utils       = require("./lib/utils")

# Module to store the modules registered in the application
config.modules = modules = new Modules()

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

# # Socket.IO
# io = require("socket.io")
# # reduce logging
# io.set('log level', 1)

# Router
config.modules.register "MainRouter", new MainRouter()

# Application modules
config.modules.register "RedisPubSub", new RedisPubSub()
config.modules.register "MessageBus", new MessageBus()
config.modules.register "Controller", new Controller()

clientProxy = new ClientProxy()
config.modules.register "ClientProxy", clientProxy
clientProxy.listen(app)
