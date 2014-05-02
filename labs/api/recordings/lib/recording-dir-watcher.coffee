##
## Watches the recording dirs for new recordings
##

chokidar = require 'chokidar'
redis    = require 'redis'

log      = require './logger'


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