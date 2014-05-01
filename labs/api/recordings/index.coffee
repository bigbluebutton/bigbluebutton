bunyan   = require 'bunyan'
chokidar = require 'chokidar'
Hapi     = require 'hapi'
redis    = require 'redis'

pack     = require './package'
routes   = require './lib/routes'

client = redis.createClient()

baseKey = 'bbb:recordings:'

#clear the keys first
keys = client.keys(baseKey.concat('*'))
client.del(keys)

#start watching
chokidar.watch('/var/bigbluebutton/published', {ignored: /[\/\\]\./}).on 'all', (event, path)->
  somethingChanged(event,path)
chokidar.watch('/var/bigbluebutton/unpublished', {ignored: /[\/\\]\./}).on 'all', (event, path)->
  somethingChanged(event,path)  


somethingChanged = (event, path) ->
  uri = path.split('/')

  if uri[5]? #excludes the parent directories being added
    #console.log "\nstart" + uri.toString()

    meetingID = path.substring(path.lastIndexOf('/')+1).split('-')[0]
    timestamp = path.substring(path.lastIndexOf('/')+1).split('-')[1]

    thisKey = baseKey.concat(meetingID)
    #console.log "thisKey=" + thisKey

    json = {
      "format": uri[4]
      "timestamp": timestamp
    }

    console.log(event, path) 
    str = JSON.stringify(json)

    client.sadd(thisKey, str)



###log = bunyan.createLogger({name: 'myapp'})
log.info('hi')
log.warn({lang: 'fr'}, 'au revoir')

server = Hapi.createServer("0.0.0.0",
  parseInt(process.env.PORT, 10) or 4000)

server.start(() -> 
  log.info(['start'], pack.name + ' - web interface: ' + server.info.uri)
)

server.route(routes.routes)
###
