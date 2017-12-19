/*
 * Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

"use strict";

const BigBlueButtonGW = require('../bbb/pubsub/bbb-gw');
const Screenshare = require('./screenshare');
const C = require('../bbb/messages/Constants');
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
    try {
      this._redisGateway = await this._bbbGW.addSubscribeChannel(C.TO_SCREENSHARE);
      const transcode = await this._bbbGW.addSubscribeChannel(C.FROM_BBB_TRANSCODE_SYSTEM_CHAN);
      this._redisGateway.on(C.REDIS_MESSAGE, this._onMessage.bind(this));
      console.log('  [ScreenshareManager] Successfully subscribed to redis channel');
    }
    catch (error) {
      console.log('  [ScreenshareManager] Could not connect to transcoder redis channel, finishing app...');
      console.log(error);
      this.stopAll();
    }
  }

  _onMessage(_message) {
    console.log('  [ScreenshareManager] Received message => ');
    let session;
    let message = _message;

    let sessionId = message.voiceBridge;
    let connectionId = message.connectionId;

    if(this._screenshareSessions[sessionId]) {
      session = this._screenshareSessions[sessionId];
    }

    switch (message.id) {

      case 'presenter':

        // Checking if there's already a Screenshare session started
        // because we shouldn't overwrite it

        if (!this._screenshareSessions[message.voiceBridge]) {
          this._screenshareSessions[message.voiceBridge] = {}
          this._screenshareSessions[message.voiceBridge] = session;
        }

        if(session) {
          break;
        }

        session = new Screenshare(connectionId, this._bbbGW,
            sessionId, connectionId, message.vh, message.vw,
            message.internalMeetingId);

        this._screenshareSessions[sessionId] = {}
        this._screenshareSessions[sessionId] = session;

        // starts presenter by sending sessionID, websocket and sdpoffer
        session._startPresenter(sessionId, message.sdpOffer, (error, sdpAnswer) => {
          console.log("  [ScreenshareManager] Started presenter " + sessionId);
          if (error) {
            this._bbbGW.publish(JSON.stringify({
              connectionId: session._id,
              id : 'presenterResponse',
              response : 'rejected',
              message : error
            }), C.FROM_SCREENSHARE);
            return error;
          }

          this._bbbGW.publish(JSON.stringify({
            connectionId: session._id,
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
            session._startViewer(message.connectionId, message.voiceBridge, message.sdpOffer, connectionId,
                this._screenshareSessions[message.voiceBridge]._presenterEndpoint);
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
          session.onIceCandidate(message.candidate);
        } else {
          console.log(" [iceCandidate] Why is there no session on ICE CANDIDATE?");
        }
        break;

      case 'viewerIceCandidate':
        console.log("[viewerIceCandidate] Session output => " + session);
        if (session) {
          session.onViewerIceCandidate(message.candidate, connectionId);
        } else {
          console.log("[iceCandidate] Why is there no session on ICE CANDIDATE?");
        }
        break;

      case 'close':
        console.log('  [ScreenshareManager] Connection ' + connectionId + ' closed');

        if (message.role === 'presenter' && this._screenshareSessions[sessionId]) {
          console.log("  [ScreenshareManager] Stopping presenter " + sessionId);
          this._stopSession(sessionId);
        }
        if (message.role === 'viewer' && typeof session !== 'undefined') {
          console.log("  [ScreenshareManager] Stopping viewer " + sessionId);
          session.stopViewer(message.connectionId);
        }
        break;

      default:
        this._bbbGW.publish(JSON.stringify({
          connectionId: session._id? session._id : 'none',
          id : 'error',
          message: 'Invald message ' + message
        }), C.FROM_SCREENSHARE);
        break;
    }
  }

  _stopSession(sessionId) {
    console.log(' [>] Stopping session ' + sessionId);

    if (typeof this._screenshareSessions === 'undefined' || typeof sessionId === 'undefined') {
      return;
    }

    let session = this._screenshareSessions[sessionId];
    if(typeof session !== 'undefined' && typeof session._stop === 'function') {
      session._stop();
    }

    delete this._screenshareSessions[sessionId];
  }

  stopAll() {
    console.log('\n [x] Stopping everything! ');

    if (typeof this._screenshareSessions === 'undefined') {
      return;
    }

    let sessionIds = Object.keys(this._screenshareSessions);

    for (let i = 0; i < sessionIds.length; i++) {
      this._stopSession(sessionIds[i]);
    }
  }
};
