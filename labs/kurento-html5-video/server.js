/*
 * Lucas Fialho Zawacki
 * (C) Copyright 2017 Bigbluebutton
 *
 */

var cookieParser = require('cookie-parser')
var express = require('express');
var session = require('express-session')
var ws = require('./lib/websocket');
var http = require('http');
var fs = require('fs');

var Video = require('./lib/video');

// Global variables
var app = express();
var sessions = {};

/*
 * Management of sessions
 */
app.use(cookieParser());

var sessionHandler = session({
  secret : 'Shawarma', rolling : true, resave : true, saveUninitialized : true
});

app.use(sessionHandler);

/*
 * Server startup
 */
var server = http.createServer(app).listen(3002, function() {
  console.log(' [*] Running bbb-html5 kurento video service.');
});

var wss = new ws.Server({
  server : server,
  path : '/html5video'
});

var clientId = 0;

wss.on('connection', function(ws) {
  var sessionId;
  var request = ws.upgradeReq;
  var response = {
    writeHead : {}
  };

  sessionHandler(request, response, function(err) {
    sessionId = request.session.id + "_" + clientId++;

    if (!sessions[sessionId]) {
      sessions[sessionId] = {};
    }

    console.log('Connection received with sessionId ' + sessionId);
  });

  ws.on('error', function(error) {
    console.log('Connection ' + sessionId + ' error');
    // stop(sessionId);
  });

  ws.on('close', function() {
    console.log('Connection ' + sessionId + ' closed');
    stopSession(sessionId);
  });

  ws.on('message', function(_message) {
    var message = JSON.parse(_message);

    var video;
    if (message.cameraId && sessions[sessionId][message.cameraId]) {
      video = sessions[sessionId][message.cameraId];
    }

    switch (message.id) {

      case 'start':

        console.log('[' + message.id + '] connection ' + sessionId);

        var video = new Video(ws, message.cameraId, message.cameraShared);
        sessions[sessionId][message.cameraId] = video;

        video.start(message.sdpOffer, function(error, sdpAnswer) {
          if (error) {
            return ws.sendMessage({id : 'error', message : error });
          }

          ws.sendMessage({id : 'startResponse', cameraId: message.cameraId, sdpAnswer : sdpAnswer});
        });

        break;

        case 'stop':

          console.log('[' + message.id + '] connection ' + sessionId);

          if (video) {
            video.stop(sessionId);
          } else {
            console.log(" [stop] Why is there no video on STOP?");
          }
          break;

        case 'onIceCandidate':

          if (video) {
            video.onIceCandidate(message.candidate);
          } else {
            console.log(" [iceCandidate] Why is there no video on ICE CANDIDATE?");
          }
          break;

        default:
          ws.sendMessage({ id : 'error', message : 'Invalid message ' + message });
          break;
      }

    });
});

var stopSession = function(sessionId) {

  console.log(' [>] Stopping session ' + sessionId);

  var videoIds = Object.keys(sessions[sessionId]);

  for (var i = 0; i < videoIds.length; i++) {

    var video = sessions[sessionId][videoIds[i]];
    video.stop();

    delete sessions[sessionId][videoIds[i]];
  }

  delete sessions[sessionId];
}

var stopAll = function() {

  console.log('\n [x] Stopping everything! ');

  var sessionIds = Object.keys(sessions);

  for (var i = 0; i < sessionIds.length; i++) {

    stopSession(sessionIds[i]);
  }

  setTimeout(process.exit, 1000);
}

process.on('SIGTERM', stopAll);
process.on('SIGINT', stopAll);
