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
    this._iceQueues = {};
  }

  _onMessage(message) {
    Logger.debug(this._logPrefix, 'Received message [' + message.id + '] from connection', message.connectionId);

    const sessionId = message.voiceBridge;
    const connectionId = message.connectionId;
    let iceQueue, session;

    session = this._fetchSession(sessionId);
    iceQueue = this._fetchIceQueue(sessionId);

    switch (message.id) {
      case 'presenter':
        if (session.constructor === Screenshare) {
          Logger.warn(this._logPrefix, 'There was already a session, breaking start call');
          break;
        }

        session = new Screenshare(connectionId, this._bbbGW,
            sessionId, connectionId, message.vh, message.vw,
            message.internalMeetingId);

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

          // Empty ice queue after starting session
          this._flushIceQueue(session, iceQueue);

          this._bbbGW.publish(JSON.stringify({
            connectionId: session._id,
            id : 'presenterResponse',
            response : 'accepted',
            sdpAnswer : sdpAnswer
          }), C.FROM_SCREENSHARE);

          session.once(C.MEDIA_SERVER_OFFLINE, (event) => {
            this._stopSession(sessionId);
          });

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
            // Empty ice queue after starting session
            if (iceQueue) {
              let candidate;
              while(candidate = iceQueue.pop()) {
                session.onViewerIceCandidate(candidate);
              }
            }

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
        if (session.constructor === Screenshare) {
          session.onIceCandidate(message.candidate);
        } else {
          Logger.info(this._logPrefix, "Queueing ice candidate for later in screenshare", message.voiceBridge);
          iceQueue.push(message.candidate);
        }
        break;

      case 'viewerIceCandidate':
        if (session) {
          session.onViewerIceCandidate(message.candidate, connectionId);
        } else {
          Logger.info(this._logPrefix, "Queueing ice candidate for later in screenshare", message.voiceBridge);
          iceQueue.push(message.candidate);
        }
        break;

      case 'close':
        Logger.info(this._logPrefix, 'Connection ' + connectionId + ' closed');

        if (session.constructor == Screenshare) {
          if (message.role === 'presenter' && session) {
            Logger.info(this._logPrefix, "Stopping presenter " + sessionId);
            this._stopSession(sessionId);
          }
          if (message.role === 'viewer' && session) {
            Logger.info(this._logPrefix, "Stopping viewer " + sessionId);
            session.stopViewer(message.connectionId);
          }
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
