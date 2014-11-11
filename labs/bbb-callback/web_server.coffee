express = require("express")

# Web server that listens for API calls and process them.
module.exports = class WebServer

  constructor: ->
    @app = express()

  start: (port) ->
    @server = @app.listen(port)
    unless @server.address()?
      console.log "Could not bind to port", port
      console.log "Aborting."
      process.exit(1)
    console.log "*** Server listening on port", port, "in", @app.settings.env.toUpperCase(), "mode"
