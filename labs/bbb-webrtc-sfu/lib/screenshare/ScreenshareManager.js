/*
 * Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

"use strict";

const BigBlueButtonGW = require('../bbb/pubsub/bbb-gw');
const Screenshare = require('./screenshare');
const BaseManager = require('../base/BaseManager');
const C = require('../bbb/messages/Constants');
const Logger = require('../utils/Logger');

module.exports = class ScreenshareManager extends BaseManager {
  constructor (connectionChannel, additionalChannels, logPrefix) {
    super(connectionChannel, additionalChannels, logPrefix);
    this.messageFactory(this._onMessage);
  }

  _onMessage(message) {
    Logger.debug(this._logPrefix, 'Received message [' + message.id + '] from connection', message.connectionId);

    let session;
    let sessionId = message.voiceBridge;
    let connectionId = message.connectionId;

    if(this._sessions[sessionId]) {
      session = this._sessions[sessionId];
    }

    switch (message.id) {

      case 'presenter':

        // Checking if there's already a Screenshare session started
        // because we shouldn't overwrite it

        if (!this._sessions[message.voiceBridge]) {
          this._sessions[message.voiceBridge] = {}
          this._sessions[message.voiceBridge] = session;
        }

        if(session) {
          break;
        }

        session = new Screenshare(connectionId, this._bbbGW,
            sessionId, connectionId, message.vh, message.vw,
            message.internalMeetingId);

        this._sessions[sessionId] = {}
        this._sessions[sessionId] = session;

        // starts presenter by sending sessionID, websocket and sdpoffer
        session._startPresenter(sessionId, message.sdpOffer, (error, sdpAnswer) => {
          Logger.info(this._logPrefix, "Started presenter ", sessionId, " for connection", connectionId);
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

          Logger.info(this._logPrefix, "Sending presenterResponse to presenter", sessionId, "for connection", session._id);
        });
        break;

      case 'viewer':
        if (message.sdpOffer && message.voiceBridge) {
          if (session) {
            Logger.info(this._logPrefix, "Starting screenshare viewer at", message.voiceBridge, " for viewer with connection ", message.connectionId);
            session._startViewer(message.connectionId,
                message.voiceBridge,
                message.sdpOffer,
                connectionId,
                this._sessions[message.voiceBridge]._presenterEndpoint);
          } else {
            // TODO ERROR HANDLING
          }
        }
        break;

      case 'stop':
        Logger.info(this._logPrefix, 'Received stop message for session', sessionId, "at connection", connectionId);

        if (session) {
          session._stop(sessionId);
        } else {
          Logger.warn(this._logPrefix, "There was no screensharing session on stop for", sessionId);
        }
        break;

      case 'onIceCandidate':
        if (session) {
          session.onIceCandidate(message.candidate);
        } else {
          Logger.warn(this._logPrefix, "There was no screensharing session for onIceCandidate for", sessionId, ". There should be a queue here");
        }
        break;

      case 'viewerIceCandidate':
        if (session) {
          session.onViewerIceCandidate(message.candidate, connectionId);
        } else {
          Logger.warn(this._logPrefix, "There was no screensharing session for onIceCandidate for", sessionId + ". There should be a queue here");
        }
        break;

      case 'close':
        Logger.info(this._logPrefix, 'Connection ' + connectionId + ' closed');

        if (message.role === 'presenter' && this._sessions[sessionId]) {
          Logger.info(this._logPrefix, "Stopping presenter " + sessionId);
          this._stopSession(sessionId);
        }
        if (message.role === 'viewer' && typeof session !== 'undefined') {
          Logger.info(this._logPrefix, "Stopping viewer " + sessionId);
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
};
