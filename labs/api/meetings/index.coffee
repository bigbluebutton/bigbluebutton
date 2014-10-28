Hapi = require("hapi")
pack = require './package'
routes = require './lib/routes'
bunyan = require 'bunyan'

log = bunyan.createLogger({name: 'myapp'});
log.info('hi')
log.warn({lang: 'fr'}, 'au revoir')

server = Hapi.createServer("0.0.0.0", parseInt(process.env.PORT, 10) or 4000)

server.start(() -> 
  log.info(['start'], pack.name + ' - web interface: ' + server.info.uri);
)

server.route routes.routes

