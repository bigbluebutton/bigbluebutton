util       = require './util'
recWatcher = require './recording-dir-watcher'

sharedSecret = '8cd8ef52e8e101574e400365b55e11a6'

index = (req, resp) ->
  resp "Hello World!"

createHandler = (req, resp) ->
  console.log("CREATE: " + req.originalUrl )
  checksum = req.query.checksum
  console.log("checksum = [" + checksum + "]")
  
  query = util.removeChecksumFromQuery(req.query)
  
  baseString = util.buildCreateBaseString(query)
  ourChecksum = util.calculateChecksum("create", baseString, sharedSecret)

  console.log "the checksum from url is \n" + checksum + " and mine is\n" + ourChecksum

  if checksum isnt ourChecksum
    resp "Fail!"
  else
    resp "everything is fine"

getRecordings = (req, resp) ->
  requestedMeetingID = req.query.meetingid
  console.log("recordings for: " + requestedMeetingID)

  recWatcher.getRecordingsArray requestedMeetingID, (array) ->
    if array?.length > 0
      resp JSON.stringify(array)
    else
      resp "No recordings for meetingid=#{requestedMeetingID}\n"

exports.index = index
exports.create = createHandler
exports.recordings = getRecordings
