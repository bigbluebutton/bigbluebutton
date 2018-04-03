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

let sessions = {};

var clientId = 0;

let bbbGW = new BigBlueButtonGW("MANAGER");
let redisGateway;

bbbGW.addSubscribeChannel(C.TO_VIDEO).then((gw) => {
  redisGateway = gw;
  redisGateway.on(C.REDIS_MESSAGE, _onMessage);
});

let _onMessage = async function (_message) {
  let message = _message;
  let sessionId = message.connectionId;
  let video;
  let role = message.role? message.role : 'any';
  let cameraId = message.cameraId;
  let shared = false;
  let iceQueues = {};
  let iceQueue;

  if (!message.cameraId) {
    console.log("  [VideoManager] Undefined message.cameraId for session ", sessionId);
    return;
  }

  if (message.role === 'share') {
    shared = true;
    cameraId += '-shared';
  }

  if (!sessions[sessionId]) {
    sessions[sessionId] = {};
  }

  if (!iceQueues[sessionId]) {
      iceQueues[sessionId] = {};
  }

  if (sessions[sessionId][cameraId]) {
    video = sessions[sessionId][cameraId];
  }

  if (iceQueues[sessionId][cameraId]) {
    iceQueue = iceQueues[sessionId][cameraId] ;
  }

  switch (message.id) {
    case 'start':
      Logger.info('[VideoManager] Received message [' + message.id + '] from connection ' + sessionId);
      Logger.debug('[VideoManager] Message =>', JSON.stringify(message, null, 2));

      video = new Video(bbbGW, message.meetingId, message.cameraId, shared, message.connectionId);

      // Empty ice queue after starting video
      if (iceQueue) {
        let candidate;
        while(candidate = iceQueue.pop()) {
          video.onIceCandidate(cand);
        }
      }

      sessions[sessionId][cameraId] = video;

      video.start(message.sdpOffer, (error, sdpAnswer) => {
        if (error) {
          return bbbGW.publish(JSON.stringify({
            connectionId: sessionId,
            type: 'video',
            role: role,
            id : 'error',
            response : 'rejected',
            cameraId : message.cameraId,
            message : error
          }), C.FROM_VIDEO);
        }

        bbbGW.publish(JSON.stringify({
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
        stopVideo(sessionId, role, message.cameraId);
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
          iceQueues[sessionId][cameraId] = [];
          iceQueue = iceQueues[sessionId][cameraId];
        }

        iceQueue.push(message.candidate);
      }
      break;

    case 'close':
      Logger.info("[VideoManager] Closing session for sessionId: ", sessionId);

      stopSession(sessionId);

      break;

    default:
      bbbGW.publish(JSON.stringify({
        connectionId: sessionId,
        type: 'video',
        id : 'error',
        response : 'rejected',
        message : 'Invalid message ' + JSON.stringify(message)
      }), C.FROM_VIDEO);
      break;
  }
};

let stopSession = async function(sessionId) {

  let videoIds = Object.keys(sessions[sessionId]);

  for (let i=0; i < videoIds.length; i++) {
    let camId = videoIds[i].split('-')[0], role = videoIds[i].split('-')[1];
    await stopVideo(sessionId, role ? 'share' : 'viewer', camId);
  }

  delete sessions[sessionId];
  logAvailableSessions();
}

let stopVideo = async function(sessionId, role, cameraId) {
  Logger.info('[VideoManager/x] Stopping session ' + sessionId + " with role " + role + " for camera " + cameraId);

  try {
    if (role === 'share') {
      var sharedVideo = sessions[sessionId][cameraId+'-shared'];
      if (sharedVideo) {
        Logger.info('[VideoManager] Stopping sharer [', sessionId, '][', cameraId,']');
        await sharedVideo.stop();
        if (sessions[sessionId][cameraId+'-shared']) {
          delete sessions[sessionId][cameraId+'-shared'];
        }
      }
    }
    else if (role === 'viewer') {
      var video = sessions[sessionId][cameraId];
      if (video) {
        Logger.info('[VideoManager] Stopping viewer [', sessionId, '][', cameraId,']');
        await video.stop();
        delete sessions[sessionId][cameraId];
      }
    }
    if (sessions[sessionId]) {
      delete sessions[sessionId];
    }
  }
  catch (err) {
    Logger.error("[VideoManager] Stop error => ", err);
  }
}

let stopAll = function() {
  Logger.info('[VideoManager] Stopping everything! ');

  if (sessions == null) {
    return;
  }

  let sessionIds = Object.keys(sessions);

  for (var i = 0; i < sessionIds.length; i++) {
    stopSession(sessionIds[i]);
  }

  setTimeout(process.exit, 100);
}

let logAvailableSessions = function() {
  if(sessions) {
    Logger.info("[VideoManager] Available sessions are =>");
    let sessionMainKeys = Object.keys(sessions);
    for (var k in sessions) {
      if(sessions[k]) {
        Logger.info('[VideoManager] Session[', k,'] => ', Object.keys(sessions[k]));
      }
    }
  }

}
