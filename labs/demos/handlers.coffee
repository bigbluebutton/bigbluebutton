index = (request, response) ->
  response.sendfile('./views/index.html')
  
login = (req, resp) -> #not working yet
  console.log "req=" + JSON.stringify req
  resp "heya"

exports.index = index
exports.login = login
