express  = require 'express'
http     = require 'http'
hapi     = require 'hapi'
path     = require 'path'

handlers = require './handlers'

app = express()
app.set('port', process.env.PORT || 4000)
app.set('views', '/views')

app.get('/', handlers.index)
app.post('/login', handlers.login)

http.createServer(app).listen(app.get('port'), () ->
	console.log('Express server listening on port ' + app.get('port'))
)

app.get "/*", (req, res, next) ->
  file = req.params[0]

  console.log "\t :: Express :: file requested : " + file

  #Send the requesting client the file.
  res.sendfile __dirname + "/" + file
