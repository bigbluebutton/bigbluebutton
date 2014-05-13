express  = require 'express'
http     = require 'http'
hapi     = require 'hapi'
path     = require 'path'

config   = require './config.json'
handlers = require './lib/handlers'

app = express()
app.set('port', config.settings.PORT)
app.set('views', '/views')


###cors = require('cors')

corsOptions = {
  origin: 'http://google.com'
}


app.use(cors())###

###enableCORS = (req, res, next) ->
  console.log "jjj"
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  #intercept OPTIONS method
  if ('OPTIONS' == req.method) 
    console.log "ppp"
    res.send(200);
  else 
    console.log "qqq"
    next()
# enable CORS!
app.use(enableCORS)###


app.post('/loginnn', (req, res) ->
  console.log "i am in POST loginnn"
  console.log "req = " + JSON.stringify req.body
  #res.json({"a": "b"})
  res.redirect('http://192.168.0.203:3000/')
)


app.get('/', handlers.index)
app.post('/login', handlers.login)

http.createServer(app).listen(app.get('port'), () ->
  console.log('Express server listening on port ' + app.get('port'))
)

app.get("/*", (req, res, next) ->
  file = req.params[0]
  console.log "\t :: Express :: file requested : " + file

  if file is "public/js/app.js" or file is "config.json"
    #Send the requesting client the file.
    res.sendfile __dirname + "/" + file
    next
)