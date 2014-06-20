sha1    = require 'js-sha1'

bbbapi  = require './bbbapi'
config  = require '../config.json'

bbbServer = config.settings.IP + "/bigbluebutton/api/"
sharedSecret = config.settings.salt

console.log "will be creating a meeting on server: " + bbbServer

str = "name=Demo+Meeting&meetingID=Demo+Meeting&voiceBridge=70827&attendeePW=ap&moderatorPW=mp&record=false"

console.log(sha1("create" + str + sharedSecret))

createParams = {}
createParams.attendeePW = "ap"
createParams.moderatorPW = "mp"
createParams.record = false
createParams.voiceBridge = 70827
createParams.name = "Demo Meeting"
createParams.meetingID = "Demo Meeting"

joinParams = {}
joinParams.password = "mp"
joinParams.fullName = "Richard"
joinParams.meetingID = "Demo Meeting"
joinParams.redirect = false

serverAndSecret = {server: bbbServer, secret: sharedSecret}

exports.createParams = createParams
exports.serverAndSecret = serverAndSecret
exports.joinParams = joinParams