#testapi = require 'testapi'

index = (request, response) ->
  response.sendfile('./views/index.html')
  
login = (req, resp) -> #not working yet
  console.log "req=" + JSON.stringify req.query.username
  #console.log "params = " + testapi.params.moderatorPW

#call createapi
#proceed = () ->


exports.index = index
exports.login = login
