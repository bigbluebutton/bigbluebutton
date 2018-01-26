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
  let iceQueue = {};

  if (message.role == 'share') {
    shared = true;
  }

  if (!sessions[sessionId]) {
    sessions[sessionId] = {};
  }

  switch (role) {
    case 'share':
      if (message.cameraId && typeof sessions[sessionId][message.cameraId+'-shared'] !== 'undefined' &&  sessions[sessionId][message.cameraId+'-shared']) {
        video = sessions[sessionId][message.cameraId+'-shared'];
      }
      break;
    case 'viewer':
      if (message.cameraId && sessions[sessionId][message.cameraId]) {
        video = sessions[sessionId][message.cameraId];
      }
    case 'any':
      if (message.cameraId && typeof sessions[sessionId][message.cameraId+'-shared'] !== 'undefined' &&  sessions[sessionId][message.cameraId+'-shared']) {
        video = sessions[sessionId][message.cameraId+'-shared'];
      }
      else if (message.cameraId && sessions[sessionId][message.cameraId]) {
        video = sessions[sessionId][message.cameraId];
      }

      break;
  }

  switch (message.id) {
    case 'start':
      Logger.info('[VideoManager] Received message [' + message.id + '] from connection ' + sessionId + ". Message => " + JSON.stringify(message, null, 2));

      video = new Video(bbbGW, message.cameraId, shared, message.connectionId);

      // Empty ice queue after starting video
      if (iceQueue[message.cameraId]) {
        let candidate;
        while(candidate = iceQueue[message.cameraId].pop()) {
          video.onIceCandidate(cand);
        }
      }

      switch (role) {
        case 'share':
          sessions[sessionId][message.cameraId+'-shared']= video;
          break;
        case 'viewer':
          sessions[sessionId][message.cameraId] = video;
          break;
        default: console.log(" [VideoManager] Unknown role? ", role);
      }

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
      try {
        if (video) {
          await stopVideo(sessionId, role, cameraId);
        } else {
          Logger.warn("[VideoManager] There is no video instance named", cameraId, "to stop");
        }
      }
      catch (error) {
        Logger.error("[VideoManager] stopVideo routine failed to execute with error", error);
      }
      break;

    case 'onIceCandidate':

      if (video) {
        video.onIceCandidate(message.candidate);
      } else {
        Logger.info("[VideoManager] Queueing ice candidate for later in video", message.cameraId);

        if (!iceQueue[message.cameraId]) {
          iceQueue[message.cameraId] = [];
        }
        iceQueue[message.cameraId].push(message.candidate);
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
        delete sessions[sessionId][cameraId+'-shared'];
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
  if(typeof sessions !== 'undefined' && sessions) {
    Logger.info("[VideoManager] Available sessions are =>");
    let sessionMainKeys = Object.keys(sessions);
    for (var k in sessions) {
      if(typeof sessions[k] !== 'undefined' && sessions[k]) {
        Logger.info('[VideoManager] Session[', k,'] => ', Object.keys(sessions[k]));
      }
    }
  }
}
