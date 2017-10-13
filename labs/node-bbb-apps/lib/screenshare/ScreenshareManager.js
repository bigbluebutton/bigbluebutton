/*
 * Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

"use strict";

const BigBlueButtonGW = require('../bbb/pubsub/bbb-gw');
var Screenshare = require('./screenshare');
var C = require('../bbb/messages/Constants'); 
// Global variables

module.exports = class ScreenshareManager {
  constructor (logger) {
    this._logger = logger;
    this._clientId = 0;

    this._sessions = {};
    this._screenshareSessions = {};

    this._bbbGW = new BigBlueButtonGW("MANAGER");
    this._redisGateway;
  }

  async start() {   
    let self = this;

    try {
      this._redisGateway = await this._bbbGW.addSubscribeChannel(C.TO_SCREENSHARE);
      const transcode = await this._bbbGW.addSubscribeChannel(C.FROM_BBB_TRANSCODE_SYSTEM_CHAN);
      this._redisGateway.on(C.REDIS_MESSAGE, this._onMessage.bind(this));
      process.on('message', this._onMessage.bind(this));
      console.log('  [ScreenshareManager] Successfully subscribed to redis channel');
    } 
    catch (error) {
      console.log('  [ScreenshareManager] Could not connect to transcoder redis channel, finishing app...');
      console.log(error);
      self._stopAll();
    }
  }

  _onMessage(_message) {
    console.log('  [ScreenshareManager] Received message => ');
    let self = this;
    let session;
    let message = _message;

    console.log(message);
    // The sessionId is voiceBridge for screensharing sessions
    let sessionId = message.voiceBridge;
    if(this._screenshareSessions[sessionId]) {
      session = this._screenshareSessions[sessionId];
    }

    switch (message.id) {

      case 'presenter':

        // Checking if there's already a Screenshare session started
        // because we shouldn't overwrite it

        if (!self._screenshareSessions[message.voiceBridge]) {
          self._screenshareSessions[message.voiceBridge] = {}
          self._screenshareSessions[message.voiceBridge] = session;
        }

        //session.on('message', self._assembleSessionMessage.bind(self));
        if(session) {
          break;
        }

        session = new Screenshare(sessionId, self._bbbGW,
            sessionId, message.callerName, message.vh, message.vw,
            message.internalMeetingId);

        self._screenshareSessions[sessionId] = {}
        self._screenshareSessions[sessionId] = session;

        // starts presenter by sending sessionID, websocket and sdpoffer
        session._startPresenter(sessionId, message.sdpOffer, function(error, sdpAnswer) {
          console.log("  [ScreenshareManager] Started presenter " + sessionId);
          if (error) {
            self._bbbGW.publish(JSON.stringify({
              id : 'presenterResponse',
              response : 'rejected',
              message : error
            }), C.FROM_SCREENSHARE);
            return error;
          }

          self._bbbGW.publish(JSON.stringify({
            id : 'presenterResponse',
            response : 'accepted',
            sdpAnswer : sdpAnswer
          }), C.FROM_SCREENSHARE);

          console.log("  [ScreenshareManager]  [websocket] Sending presenterResponse \n" + sdpAnswer);
        });
        break;

      case 'viewer':
        console.log("  [ScreenshareManager][viewer] Session output \n " + session);
        if (message.sdpOffer && message.voiceBridge) {
          if (session) {
            session._startViewer(message.voiceBridge, message.sdpOffer, message.callerName, self._screenshareSessions[message.voiceBridge]._presenterEndpoint);
          } else {
            // TODO ERROR HANDLING
          }
        }
        break;

      case 'stop':
        console.log('[' + message.id + '] connection ' + sessionId);

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
        self._bbbGW.publish(JSON.stringify({
          id : 'pong',
          response : 'accepted'
        }), C.FROM_SCREENSHARE);
        break;


      case 'viewerIceCandidate':
        console.log("[viewerIceCandidate] Session output => " + session);
        if (session) {
          session._onViewerIceCandidate(message.candidate, message.callerName);
        } else {
          console.log("[iceCandidate] Why is there no session on ICE CANDIDATE?");
        }
        break;

      default:
        self._bbbGW.publish(JSON.stringify({
          id : 'error',
          message: 'Invald message ' + message
        }), C.FROM_SCREENSHARE);
        break;
    }
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
};
