/*
 * Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

var cookieParser = require('cookie-parser')
var express = require('express');
var session = require('express-session')
var wsModule = require('./lib/websocket');
var http = require('http');
var fs = require('fs');
var Screenshare = require('./lib/screenshare');
var Constants = require('./lib/bbb/messages/Constants');

// Global variables
var app = express();
var sessions = {};
var BigBlueButtonGW = require('./lib/bbb/pubsub/bbb-gw');

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
var server = http.createServer(app).listen(3008, function() {
  console.log(' [*] Running bbb-screenshare kurento screenshare service.');
});

var wss = new wsModule.Server({
  server : server,
  path : '/kurento-screenshare'
});

var clientId = 0;

var bbbGW = new BigBlueButtonGW();

bbbGW.addSubscribeChannel(Constants.FROM_BBB_TRANSCODE_SYSTEM_CHAN, function(error, redisWrapper) {
  if(error) {
    console.log(' Could not connect to transcoder redis channel, finishing app...');
    stopAll();
  }
  console.log('  [server] Successfully subscribed to redis channel');
});


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

    var screenshare;

    if (message.presenterId && sessions[sessionId][message.presenterId]) {
      screenshare = sessions[sessionId][message.presenterId];
    }

    switch (message.id) {

      case 'presenter':
        console.log('Presenter message => [' + message.id + '] connection [' + sessionId + '][' + message.presenterId + '][' + message.voiceBridge + '][' + message.callerName + ']');

        screenshare = new Screenshare(ws, message.presenterId, bbbGW, message.voiceBridge, message.callerName, message.vh, message.vw);
        sessions[sessionId][message.presenterId] = screenshare;

        // starts presenter by sending sessionID, websocket and sdpoffer
        screenshare.startPresenter(sessionId, ws, message.sdpOffer, function(error, sdpAnswer) {
          console.log(" Started presenter " + sessionId);
          if (error) {
            return ws.send(JSON.stringify({
              id : 'presenterResponse',
              response : 'rejected',
              message : error
            }));
          }

          ws.send(JSON.stringify({
            id : 'presenterResponse',
            response : 'accepted',
            sdpAnswer : sdpAnswer
          }));
          console.log("  [websocket] Sending presenterResponse \n" + sdpAnswer);
        });
        break;

      case 'viewer':
        console.log('Viewer message => [' + message.id + '] connection [' + sessionId + '][' + message.presenterId + '][' + message.voiceBridge + '][' + message.callerName + ']');

        break;
      case 'stop':

        console.log('[' + message.id + '] connection ' + sessionId);

        if (screenshare) {
          screenshare.stop(sessionId);
        } else {
          console.log(" [stop] Why is there no screenshare on STOP?");
        }
        break;

      case 'onIceCandidate':
        if (screenshare) {
          screenshare.onIceCandidate(message.candidate);
        } else {
          console.log(" [iceCandidate] Why is there no screenshare on ICE CANDIDATE?");
        }
        break;

      case 'ping':
        ws.send(JSON.stringify({
          id : 'pong',
          response : 'accepted'
        }));
        break;

      default:
        ws.sendMessage({ id : 'error', message : 'Invalid message ' + message });
        break;
    }
  });
});

var stopSession = function(sessionId) {

  console.log(' [>] Stopping session ' + sessionId);

  var screenshareIds = Object.keys(sessions[sessionId]);

  for (var i = 0; i < screenshareIds.length; i++) {

    var screenshare = sessions[sessionId][screenshareIds[i]];
    screenshare.stop();

    delete sessions[sessionId][screenshareIds[i]];
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
