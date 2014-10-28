hapi = require 'hapi'
Joi  = require 'joi'
util = require './util'
sha1 = require 'js-sha1'

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

	
exports.index = index
exports.create = createHandler
