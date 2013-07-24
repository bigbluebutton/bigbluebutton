//default global variables
max_chat_length = 140;
max_username_length = 30;
max_meetingid_length = 10;
maxImage = 3;


// Module dependencies
var express = require('express'),
  app = module.exports = express.createServer(),
  io = require('socket.io').listen(app),
  RedisStore = require('connect-redis')(express),
  redis = require('redis');

  routes = require('./routes');

  hat = require('hat');
  rack = hat.rack();
  format = require('util').format;
  fs = require('fs');
  im = require('imagemagick');
  
  util = require('util');
  exec = require('child_process').exec;
  ip_address = 'localhost';
  
  //global variables
  redisAction = require('./redis');
  socketAction = require('./routes/socketio');
  sanitizer = require('sanitizer');
  store = redis.createClient();
  store.flushdb();
  pub = redis.createClient();
  sub = redis.createClient();
  
  subscriptions = ['*'];
  sub.psubscribe.apply(sub, subscriptions);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express['static'](__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  //Redis
  app.use(express.session({
    secret: "password",
    cookie: { secure: true },
    store: new RedisStore({
      host: "127.0.0.1",
      port: "6379"
    }),
    key: 'express.sid'
  }));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

/**
 * If a page requires authentication to view, this
 * function is used to verify they are logged in.
 * @param  {Object}   req   Request object from client
 * @param  {Object}   res   Response object to client
 * @param  {Function} next  To be run as a callback if valid
 * @return {undefined}      Response object is used to send data back to the client
 */
function requiresLogin(req, res, next) {
  //check that they have a cookie with valid session id
  redisAction.isValidSession(req.cookies['meetingid'], req.cookies['sessionid'], function(isValid) {
    if(isValid) {
      next();
    } else {
      res.redirect('/');
    }
  });
}

// Routes (see /routes/index.js)
app.get('/', routes.get_index);
app.post('/chat',  routes.post_chat);
app.post('/logout', requiresLogin, routes.logout);
app.get('/chat', requiresLogin, routes.get_chat);
app.post('/', routes.post_index);
app.get('/join', routes.join);

// --- 404 (keep as last route) --- //
app.get('*', routes.error404);
app.post('*', routes.error404);

// Start the web server listening
app.listen(3000, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

// Socket.IO Routes

/**
 * This function is used to parse a variable value from a cookie string.
 * @param  {String} cookie_string The cookie to parse.
 * @param  {String} c_var         The variable to extract from the cookie.
 * @return {String} The value of the variable extracted.
 */
function getCookie(cookie_string, c_var) {
  if(cookie_string) {
    var i,x,y,ARRcookies=cookie_string.split(";");
    for (i=0;i<ARRcookies.length;i++) {
      x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
      x=x.replace(/^\s+|\s+$/g,"");
      if (x==c_var) {
        return unescape(y);
      }
    }
  }
  else {
    console.log("Invalid cookie");
    return "";
  }
}

/**
 * Authorize a session before it given access to connect to SocketIO
 */
io.configure(function () {
  io.set('authorization', function (handshakeData, callback) {
    var sessionID = getCookie(handshakeData.headers.cookie, "sessionid");
    var meetingID = getCookie(handshakeData.headers.cookie, "meetingid");
    redisAction.isValidSession(meetingID, sessionID, function(isValid) {
      if(!isValid) {
        console.log("Invalid sessionID/meetingID");
        callback(null, false); //failed authorization
      }
      else {
        redisAction.getUserProperties(meetingID, sessionID, function (properties) {
          handshakeData.sessionID = sessionID;
          handshakeData.username = properties.username;
          handshakeData.meetingID = properties.meetingID;
          callback(null, true); // good authorization
        });
      }
    });
  });
});

// When someone connects to the websocket. Includes all the SocketIO events.

io.sockets.on('connection', socketAction.SocketOnConnection);

// Redis Routes
/**
 * When Redis Sub gets a message from Pub
 * @param  {String} pattern Matched pattern on Redis PubSub
 * @param  {String} channel Channel the pmessage was published on (socket room)
 * @param  {String} message Message published (socket message data)
 * @return {undefined}
 */
sub.on("pmessage", function(pattern, channel, message) {
  //value of pub channel is used as the name of the SocketIO room to send to.
  var channel_viewers = io.sockets.in(channel);
  //apply the parameters to the socket event, and emit it on the channels
  channel_viewers.emit.apply(channel_viewers, JSON.parse(message));
});
