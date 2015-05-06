config = require("./config")
Hook = require("./hook")
IDMapping = require("./id_mapping")
WebHooks = require("./web_hooks")
WebServer = require("./web_server")

# Class that defines the application. Listens for events on redis and starts the
# process to perform the callback calls.
# TODO: add port (-p) and log level (-l) to the command line args
module.exports = class Application

  constructor: ->
    @webHooks = new WebHooks()
    @webServer = new WebServer()

  start: ->
    Hook.initialize =>
      IDMapping.initialize =>
        @webServer.start(config.server.port)
        @webHooks.start()
