express        = require 'express'
meetingHandler = require './routes/meeting'
http           = require 'http'
path           = require 'path'

app = express()

app.configure(() -> 
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
)

app.configure('development', () ->
  app.use(express.errorHandler())
)

app.get('/bigbluebutton/api/create', meetingHandler.createHandler)

http.createServer(app).listen(app.get('port'), () ->
  console.log("Express server listening on port " + app.get('port'));
)