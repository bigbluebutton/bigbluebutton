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
const Logger = require('../utils/Logger');

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
    }
    catch (error) {
      Logger.error('[ScreenshareManager] Could not connect to transcoder redis channel, finishing screensharing app with error', error);
      this.stopAll();
    }
  }

  _onMessage(message) {
    Logger.info('[ScreenshareManager] Received message [' + message.id + '] from connection', message.connectionId);

    let session;

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
          Logger.info("[ScreenshareManager] Started presenter ", sessionId, " for connection", connectionId);
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

          Logger.info("[ScreenshareManager] Sending presenterResponse to presenter", sessionId, "for connection", session._id);
        });
        break;

      case 'viewer':
        if (message.sdpOffer && message.voiceBridge) {
          if (session) {
            Logger.info("[ScreenshareManager] Starting screenshare viewer at", message.voiceBridge, " for viewer with connection ", message.connectionId);
            session._startViewer(message.connectionId,
                message.voiceBridge,
                message.sdpOffer,
                connectionId,
                this._screenshareSessions[message.voiceBridge]._presenterEndpoint);
          } else {
            // TODO ERROR HANDLING
          }
        }
        break;

      case 'stop':
        Logger.info('[ScreenshareManager] Received stop message for session', sessionId, "at connection", connectionId);

        if (session) {
          session._stop(sessionId);
        } else {
          Logger.warn("[ScreenshareManager] There was no screensharing session on stop for", sessionId);
        }
        break;

      case 'onIceCandidate':
        if (session) {
          session.onIceCandidate(message.candidate);
        } else {
          Logger.warn("[ScreenshareManager] There was no screensharing session for onIceCandidate for", sessionId, ". There should be a queue here");
        }
        break;

      case 'viewerIceCandidate':
        if (session) {
          session.onViewerIceCandidate(message.candidate, connectionId);
        } else {
          Logger.warn("[ScreenshareManager] There was no screensharing session for onIceCandidate for", sessionId + ". There should be a queue here");
        }
        break;

      case 'close':
        Logger.info('[ScreenshareManager] Connection ' + connectionId + ' closed');

        if (message.role === 'presenter' && this._screenshareSessions[sessionId]) {
          Logger.info("[ScreenshareManager] Stopping presenter " + sessionId);
          this._stopSession(sessionId);
        }
        if (message.role === 'viewer' && typeof session !== 'undefined') {
          Logger.info("[ScreenshareManager] Stopping viewer " + sessionId);
          session.stopViewer(message.connectionId);
        }
        break;

      default:
        this._bbbGW.publish(JSON.stringify({
          connectionId: session._id? session._id : 'none',
          id : 'error',
          message: 'Invalid message ' + message
        }), C.FROM_SCREENSHARE);
        break;
    }
  }

  _stopSession(sessionId) {
    Logger.info('[ScreenshareManager] Stopping session ' + sessionId);

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
    Logger.info('[ScreenshareManager] Stopping everything! ');

    if (typeof this._screenshareSessions === 'undefined') {
      return;
    }

    let sessionIds = Object.keys(this._screenshareSessions);

    for (let i = 0; i < sessionIds.length; i++) {
      this._stopSession(sessionIds[i]);
    }
  }
};
