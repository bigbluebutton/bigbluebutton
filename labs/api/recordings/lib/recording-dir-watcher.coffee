##
## Watches the recording dirs for new recordings
##

chokidar = require 'chokidar'
redis    = require 'redis'

log      = require './logger'


client = redis.createClient()

baseKey = 'bbb:recordings:'

watch = ->
  #clear the keys first
  keys = client.keys(baseKey.concat('*'))
  client.del(keys)

  #start watching
  chokidar.watch('/var/bigbluebutton/published', {ignored: /[\/\\]\./}).on 'all', (event, path) ->
    somethingChanged(event,path)
  chokidar.watch('/var/bigbluebutton/unpublished', {ignored: /[\/\\]\./}).on 'all', (event, path) ->
    somethingChanged(event,path)


somethingChanged = (event, path) ->
  uri = path.split('/')

  if uri[5]? #excludes the parent directories being added
    pathArray = path.substring(path.lastIndexOf('/')+1).split('-')
    meetingID = pathArray[0]
    timestamp = pathArray[1]

    thisKey = baseKey.concat(meetingID)

    json = {
      "format": uri[4]
      "timestamp": timestamp
    }

    log.info(event, path)
    str = JSON.stringify(json)

    client.sadd(thisKey, str)

getRecordingsArray = (meetingID, callback) ->
  thisKey = baseKey.concat(meetingID)

  client.smembers thisKey, (err, members) ->
    if err
      console.log "Error: #{err}"
    else
      callback members

exports.watch = watch
exports.getRecordingsArray = getRecordingsArray