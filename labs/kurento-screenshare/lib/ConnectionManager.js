/*
 * Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

'use strict'

const cookieParser = require('cookie-parser')
const express = require('express');
const session = require('express-session')
const wsModule = require('./websocket');
const http = require('http');
const fs = require('fs');
const BigBlueButtonGW = require('./bbb/pubsub/bbb-gw');
var Screenshare = require('./screenshare');
var C = require('./bbb/messages/Constants');

// Global variables

module.exports = class ConnectionManager {

  constructor (settings, logger) {
    this._logger = logger;
    this._clientId = 0;
    this._app = express();
    this._screenshareSessions = {};

    this._setupExpressSession();
    this._setupHttpServer();
  }

  _setupExpressSession() {
    this._app.use(cookieParser());

    this._sessionHandler = session({
      secret : 'Shawarma', rolling : true, resave : true, saveUninitialized : true
    });

    this._app.use(this._sessionHandler);
  }

  _setupHttpServer() {
    let self = this;
    /*
     * Server startup
     */
    this._httpServer = http.createServer(this._app).listen(3008, function() {
      console.log(' [*] Running node-apps connection manager.');
    });

    /*
     * Management of sessions
     */
    this._wss = new wsModule.Server({
      server : this._httpServer,
      path : '/kurento-screenshare'
    });


    // TODO isolate this
    this._bbbGW = new BigBlueButtonGW();

    this._bbbGW.addSubscribeChannel(C.FROM_BBB_TRANSCODE_SYSTEM_CHAN, function(error, redisWrapper) {
      if(error) {
        console.log(' Could not connect to transcoder redis channel, finishing app...');
        self._stopAll();
      }
      console.log('  [server] Successfully subscribed to redis channel');
    });


    this._wss.on('connection', self._onNewConnection.bind(self));
  }

  _onNewConnection(webSocket) {
    let self = this;
    let connectionId;
    let request = webSocket.upgradeReq;
    let sessionId;
    let response = {
      writeHead : {}
    };

    this._sessionHandler(request, response, function(err) {
      connectionId = request.session.id + "_" + self._clientId++;
      console.log('Connection received with connectionId ' + connectionId);
    });

    webSocket.on('error', function(error) {
      console.log('Connection ' + connectionId + ' error');
      self._stopSession(sessionId);
    });

    webSocket.on('close', function() {
      console.log('Connection ' + connectionId + ' closed');
      self._stopSession(sessionId);
    });

    webSocket.on('message', function(_message) {
      let message = JSON.parse(_message);
      let session;
      // The sessionId is voiceBridge for screensharing sessions
      sessionId = message.voiceBridge;

      if(self._screenshareSessions[sessionId]) {
        session = self._screenshareSessions[sessionId];
      }

      switch (message.id) {

        case 'presenter':

          // Checking if there's already a Screenshare session started
          // because we shouldn't overwrite it

          if(session) {
            break;
          }

          session = new Screenshare(webSocket, connectionId, self._bbbGW,
              sessionId, message.callerName, message.vh, message.vw,
              message.internalMeetingId);

          self._screenshareSessions[sessionId] = {}
          self._screenshareSessions[sessionId] = session;

          // starts presenter by sending sessionID, websocket and sdpoffer
          session._startPresenter(connectionId, webSocket, message.sdpOffer, function(error, sdpAnswer) {
            console.log(" Started presenter " + connectionId);
            if (error) {
              return webSocket.send(JSON.stringify({
                id : 'presenterResponse',
                response : 'rejected',
                message : error
              }));
            }

            webSocket.send(JSON.stringify({
              id : 'presenterResponse',
              response : 'accepted',
              sdpAnswer : sdpAnswer
            }));
            console.log("  [websocket] Sending presenterResponse \n" + sdpAnswer);
          });
          break;

        case 'viewer':
          console.log('Viewer message => [' + message.id + '] connection [' + connectionId + '][' + message.presenterId + '][' + message.sessionId + '][' + message.callerName + ']');

          break;
        case 'stop':

          console.log('[' + message.id + '] connection ' + connectionId);

          if (session) {
            session._stop(sessionId);
          } else {
            console.log(" [stop] Why is there no session on STOP?");
          }
          break;

        case 'onIceCandidate':
          if (session) {
            session._onIceCandidate(message.candidate);
          } else {
            console.log(" [iceCandidate] Why is there no session on ICE CANDIDATE?");
          }
          break;

        case 'ping':
          webSocket.send(JSON.stringify({
            id : 'pong',
            response : 'accepted'
          }));
          break;

        default:
          webSocket.sendMessage({ id : 'error', message : 'Invalid message ' + message });
          break;
      }
    });
  }

  _stopSession(sessionId) {
    console.log(' [>] Stopping session ' + sessionId);
    let session = this._screenshareSessions[sessionId];
    if(typeof session !== 'undefined' && typeof session._stop === 'function') {
      session._stop();
    }

    delete this._screenshareSessions[sessionId];
  }

  _stopAll() {
    console.log('\n [x] Stopping everything! ');
    let sessionIds = Object.keys(this._screenshareSessions);

    for (let i = 0; i < sessionIds.length; i++) {
      this._stopSession(sessionIds[i]);
    }

    setTimeout(process.exit, 1000);
  }
}
