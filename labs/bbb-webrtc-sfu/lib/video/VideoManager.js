/*
 * Lucas Fialho Zawacki
 * (C) Copyright 2017 Bigbluebutton
 *
 */

'use strict';

const BigBlueButtonGW = require('../bbb/pubsub/bbb-gw');
const Video = require('./video');
const BaseManager = require('../base/BaseManager');
const C = require('../bbb/messages/Constants');
const Logger = require('../utils/Logger');

module.exports = class VideoManager extends BaseManager {
  constructor (connectionChannel, additionalChannels, logPrefix) {
    super(connectionChannel, additionalChannels, logPrefix);
    this.messageFactory(this._onMessage);
    this._iceQueues = {};
  }

  setStreamAsRecorded (id) {
    let video = this._sessions[id];

    if (video) {
      Logger.info("[VideoManager] Setting ", id, " as recorded");
      video.setRecorded();
    } else {
      Logger.warn("[VideoManager] Tryed to set stream to recorded but ", id, " has no session!");
    }
  }  

  async _onMessage (_message) {
    let message = _message;
    let connectionId = message.connectionId;
    let sessionId;
    let video;
    let role = message.role? message.role : 'any';
    let cameraId = message.cameraId;
    let shared = role === 'share' ? true : false;
    let iceQueue;

    if (!message.cameraId && message.id !== 'close') {
      Logger.warn(this._logPrefix, 'Undefined message.cameraId for session', sessionId);
      return;
    }

    cameraId += '-' + role;

    sessionId = connectionId + cameraId;

    if (!this._sessions[sessionId] && typeof message.cameraId !== 'undefined') {
      this._sessions[sessionId] = {};
    }

    if (!this._iceQueues[sessionId] && message.cameraId) {
      this._iceQueues[sessionId] = [];
    }

    if (this._sessions[sessionId]) {
      video = this._sessions[sessionId];
    }

    if (this._iceQueues[sessionId]) {
      iceQueue = this._iceQueues[sessionId] ;
    }


    Logger.debug(this._logPrefix, 'Message =>', message);

    switch (message.id) {
      case 'start':
        Logger.info(this._logPrefix, 'Received message [' + message.id + '] from connection ' + sessionId);

        video = new Video(this._bbbGW, message.meetingId, message.cameraId, shared, message.connectionId);

        // Empty ice queue after starting video
        if (iceQueue) {
          let candidate;
          while(candidate = iceQueue.pop()) {
            video.onIceCandidate(candidate);
          }
        }

        this._sessions[sessionId] = video;

        video.start(message.sdpOffer, (error, sdpAnswer) => {
          if (error) {
            return this._bbbGW.publish(JSON.stringify({
              connectionId: connectionId,
              type: 'video',
              role: role,
              id : 'error',
              response : 'rejected',
              cameraId : message.cameraId,
              message : error
            }), C.FROM_VIDEO);
          }

          video.once(C.MEDIA_SERVER_OFFLINE, async (event) => {
            this._stopSession(sessionId);
          });

          this._bbbGW.publish(JSON.stringify({
            connectionId: connectionId,
            type: 'video',
            role: role,
            id : 'startResponse',
            cameraId: message.cameraId,
            sdpAnswer : sdpAnswer
          }), C.FROM_VIDEO);
        });
        break;

      case 'stop':
        this._stopSession(sessionId);
        break;

      case 'onIceCandidate':
        if (video.constructor === Video) {
          video.onIceCandidate(message.candidate);
        } else {
          Logger.info(this._logPrefix, "Queueing ice candidate for later in video", cameraId);
          if (!iceQueue) {
            this._iceQueues[sessionId] = [];
            iceQueue = this._iceQueues[sessionId];
          }

          iceQueue.push(message.candidate);
        }
        break;

      case 'close':
        Logger.info(this._logPrefix, "Closing sessions of connection", connectionId);

        let keys = Object.keys(this._sessions);
        for (var k in this._sessions) {
          let session = this._sessions[k];
          if(session && session.connectionId === connectionId) {
            let killedSessionId = session.connectionId + session.id + "-" + role;
            this._stopSession(killedSessionId);
          }
        }
        break;

      default:
        this._bbbGW.publish(JSON.stringify({
          connectionId: connectionId,
          type: 'video',
          id : 'error',
          response : 'rejected',
          message : 'Invalid message ' + JSON.stringify(message)
        }), C.FROM_VIDEO);
        break;
    }
  }
}
