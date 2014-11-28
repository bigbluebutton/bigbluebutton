connect  = require 'connect'
express  = require 'express'
http     = require 'http'

config   = require './config.json'
handlers = require './lib/handlers'

app = express()
app.set('port', config.settings.PORT)
app.set('views', '/views')
app.use(connect.bodyParser())

app.get('/', handlers.index)
app.post('/login', handlers.login)

http.createServer(app).listen(app.get('port'), () ->
  console.log('Express server listening on port ' + app.get('port'))
)

app.get("/*", (req, res, next) ->
  file = req.params[0]
  console.log "\t :: Express :: file requested : " + file

  if file is "public/js/app.js" or file is "public/stylesheets/login.css" or file is "config.json"
    #Send the requesting client the file.
    res.sendfile __dirname + "/" + file
    next
)

