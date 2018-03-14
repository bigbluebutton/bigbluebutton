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

        video = new Video(this._bbbGW, message.cameraId, shared, message.connectionId);

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
        if (video.constructor=== Video) {
          this._stopSession(sessionId, role, message.cameraId);
        } else {
          Logger.warn(this._logPrefix, "There is no video instance named", cameraId, "to stop");
        }
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
        Logger.info(this._logPrefix, "Closing session for sessionId: ", sessionId);

        let keys = Object.keys(this._sessions);
        for (var k in this._sessions) {
          if(this._sessions[k].connectionId === connectionId) {
            this._stopSession(sessionId);
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
