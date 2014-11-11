config = require("./config")
WebHooks = require("./web_hooks")
WebServer = require("./web_server")

# Class that defines the application. Listens for events on redis and starts the
# process to perform the callback calls.
module.exports = class Application

  constructor: ->
    @webHooks = new WebHooks()
    @webServer = new WebServer()

  start: ->
    @webServer.start(config.server.port)
    @webHooks.start()
