parser  = require 'parser'

bbbapi  = require './bbbapi'
testapi = require './testapi'

index = (request, response) ->
  response.sendfile('./views/index.html')
  
login = (req, resp) ->

  createParams = testapi.createParams
  joinParams = testapi.joinParams
  serverAndSecret = testapi.serverAndSecret

  #use the name from the textbox
  console.log "req=" + JSON.stringify req.query.username
  joinParams.fullName = JSON.stringify req.query.username

  #calling createapi
  bbbapi.create(createParams, serverAndSecret, {}, (error, response, body) ->
    #console.log JSON.stringify(response)
    bbbapi.join(joinParams, serverAndSecret, {}, (error, response, body) ->
      #console.log JSON.stringify(response)
    )
  )


exports.index = index
exports.login = login
