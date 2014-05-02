Hapi     = require 'hapi'
pack     = require './package'

log        = require './lib/logger'
recWatcher = require './lib/recording-dir-watcher'
routes     = require './lib/routes'

server = Hapi.createServer("0.0.0.0",
  parseInt(process.env.PORT, 10) or 4000)

server.start(() -> 
  log.info(['start'], pack.name + ' - web interface: ' + server.info.uri)
)

server.route(routes.routes)
