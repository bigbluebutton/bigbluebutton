express  = require 'express'
http     = require 'http'
hapi     = require 'hapi'
path     = require 'path'

config   = require './config.json'
handlers = require './lib/handlers'

app = express()
app.set('port', config.settings.PORT)
app.set('views', '/views')


cors = require('cors')

corsOptions = {
  origin: 'http://google.com'
}









app.get('/', handlers.index)
app.post('/login', cors(corsOptions), handlers.login)

http.createServer(app).listen(app.get('port'), () ->
	console.log('Express server listening on port ' + app.get('port'))
)

app.get "/*", (req, res, next) ->
  file = req.params[0]

  console.log "\t :: Express :: file requested : " + file

  #Send the requesting client the file.
  res.sendfile __dirname + "/" + file

