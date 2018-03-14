/*
 * Lucas Fialho Zawacki
 * (C) Copyright 2017 Bigbluebutton
 *
 */

'use strict';

const BigBlueButtonGW = require('../bbb/pubsub/bbb-gw');
const Video = require('./video');
const C = require('../bbb/messages/Constants');
const Logger = require('../utils/Logger');

module.exports = class VideoManager {
  constructor() {
    this.sessions = {};
    this.bbbGW = new BigBlueButtonGW();
    this.redisGateway;
    this.iceQueues = {};
  }

  start () {
    this.bbbGW.addSubscribeChannel(C.TO_VIDEO).then((gw) => {
      this.redisGateway = gw;
      this.redisGateway.on(C.REDIS_MESSAGE, this._onMessage.bind(this));
    });
  }

  async _onMessage (_message) {
    let message = _message;
    let sessionId = message.connectionId;
    let video;
    let role = message.role? message.role : 'any';
    let cameraId = message.cameraId;
    let shared = false;
    let iceQueue;

    if (!message.cameraId) {
      Logger.warn("  [VideoManager] Undefined message.cameraId for session ", sessionId);
      return;
    }

    if (message.role === 'share') {
      shared = true;
      cameraId += '-shared';
    }

    if (!this.sessions[sessionId]) {
      this.sessions[sessionId] = {};
    }

    if (!this.iceQueues[sessionId]) {
      this.iceQueues[sessionId] = {};
    }

    if (this.sessions[sessionId][cameraId]) {
      video = this.sessions[sessionId][cameraId];
    }

    if (this.iceQueues[sessionId][cameraId]) {
      iceQueue = this.iceQueues[sessionId][cameraId] ;
    }

    switch (message.id) {
      case 'start':
        Logger.info('[VideoManager] Received message [' + message.id + '] from connection ' + sessionId);
        Logger.debug('[VideoManager] Message =>', JSON.stringify(message, null, 2));

        video = new Video(this.bbbGW, message.cameraId, shared, message.connectionId);

        // Empty ice queue after starting video
        if (iceQueue) {
          let candidate;
          while(candidate = iceQueue.pop()) {
            video.onIceCandidate(cand);
          }
        }

        this.sessions[sessionId][cameraId] = video;

        video.start(message.sdpOffer, (error, sdpAnswer) => {
          if (error) {
            return this.bbbGW.publish(JSON.stringify({
              connectionId: sessionId,
              type: 'video',
              role: role,
              id : 'error',
              response : 'rejected',
              cameraId : message.cameraId,
              message : error
            }), C.FROM_VIDEO);
          }

          this.bbbGW.publish(JSON.stringify({
            connectionId: sessionId,
            type: 'video',
            role: role,
            id : 'startResponse',
            cameraId: message.cameraId,
            sdpAnswer : sdpAnswer
          }), C.FROM_VIDEO);
        });
        break;

      case 'stop':
        if (video) {
          this._stopVideo(sessionId, role, message.cameraId);
        } else {
          Logger.warn("[VideoManager] There is no video instance named", cameraId, "to stop");
        }
        break;

      case 'onIceCandidate':

        if (video) {
          video.onIceCandidate(message.candidate);
        } else {
          Logger.info("[VideoManager] Queueing ice candidate for later in video", cameraId);
          if (!iceQueue) {
            this.iceQueues[sessionId][cameraId] = [];
            iceQueue = this.iceQueues[sessionId][cameraId];
          }

          iceQueue.push(message.candidate);
        }
        break;

      case 'close':
        Logger.info("[VideoManager] Closing session for sessionId: ", sessionId);

        this._stopSession(sessionId);

        break;

      default:
        this.bbbGW.publish(JSON.stringify({
          connectionId: sessionId,
          type: 'video',
          id : 'error',
          response : 'rejected',
          message : 'Invalid message ' + JSON.stringify(message)
        }), C.FROM_VIDEO);
        break;
    }
  }

  async _stopSession (sessionId) {

    let videoIds = Object.keys(this.sessions[sessionId]);

    for (let i=0; i < videoIds.length; i++) {
      let camId = videoIds[i].split('-')[0], role = videoIds[i].split('-')[1];
      await this._stopVideo(sessionId, role ? 'share' : 'viewer', camId);
    }

    delete this.sessions[sessionId];
    this.logAvailableSessions();
  }

  async _stopVideo (sessionId, role, cameraId) {
    Logger.info('[VideoManager/x] Stopping session ' + sessionId + " with role " + role + " for camera " + cameraId);

    try {
      if (role === 'share') {
        var sharedVideo = this.sessions[sessionId][cameraId+'-shared'];
        if (sharedVideo) {
          Logger.info('[VideoManager] Stopping sharer [', sessionId, '][', cameraId,']');
          await sharedVideo.stop();
          delete this.sessions[sessionId][cameraId+'-shared'];
        }
      }
      else if (role === 'viewer') {
        var video = this.sessions[sessionId][cameraId];
        if (video) {
          Logger.info('[VideoManager] Stopping viewer [', sessionId, '][', cameraId,']');
          await video.stop();
          delete this.sessions[sessionId][cameraId];
        }
      }
    }
    catch (err) {
      Logger.error("[VideoManager] Stop error => ", err);
    }
  }

  stopAll () {
    Logger.info('[VideoManager] Stopping everything! ');

    if (this.sessions == null) {
      return;
    }

    let sessionIds = Object.keys(this.sessions);

    for (var i = 0; i < sessionIds.length; i++) {
      this._stopSession(sessionIds[i]);
    }

    setTimeout(process.exit, 100);
  }

  _logAvailableSessions () {
    if(this.sessions) {
      Logger.info("[VideoManager] Available sessions are =>");
      let sessionMainKeys = Object.keys(this.sessions);
      for (var k in this.sessions) {
        if(this.sessions[k]) {
          Logger.info('[VideoManager] Session[', k,'] => ', Object.keys(this.sessions[k]));
        }
      }
    }
  }
}
