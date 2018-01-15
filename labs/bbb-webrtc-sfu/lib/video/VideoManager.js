/*
 * Lucas Fialho Zawacki
 * (C) Copyright 2017 Bigbluebutton
 *
 */

'use strict';

const BigBlueButtonGW = require('../bbb/pubsub/bbb-gw');
const Video = require('./video');
const C = require('../bbb/messages/Constants');

let sessions = {};

var clientId = 0;

let bbbGW = new BigBlueButtonGW("MANAGER");
let redisGateway;

bbbGW.addSubscribeChannel(C.TO_VIDEO).then((gw) => {
  redisGateway = gw;
  redisGateway.on(C.REDIS_MESSAGE, _onMessage);
  console.log('  [VideoManager] Successfully subscribed to redis channel ' + C.TO_VIDEO);

});

var _onMessage = function (_message) {
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
      console.log('[' + message.id + '] connection ' + sessionId + " message => " + JSON.stringify(message, null, 2));

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

      console.log('[' + message.id + '] connection ' + sessionId + " with message => " + JSON.stringify(message, null, 2));

      if (video) {
        stopVideo(sessionId, role, cameraId);
      } else {
        console.log(" [stop] Why is there no video on STOP?");
      }
      break;

    case 'onIceCandidate':

      if (video) {
        video.onIceCandidate(message.candidate);
      } else {
        console.log(" [iceCandidate] Queueing ice candidate for later in video " + message.cameraId);

        if (!iceQueue[message.cameraId]) {
          iceQueue[message.cameraId] = [];
        }
        iceQueue[message.cameraId].push(message.candidate);
      }
      break;

    case 'close':
      console.log(" [vide] Closing session for sessionId: " + sessionId);

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
  console.log('  [VideoManager/x] Stopping session ' + sessionId + " with role " + role + " for camera " + cameraId);

  try {
    if (role === 'share') {
      var sharedVideo = sessions[sessionId][cameraId+'-shared'];
      if (sharedVideo) {
        console.log('  [VideoManager] Stopping sharer [', sessionId, '][', cameraId,']');
        await sharedVideo.stop();
        delete sessions[sessionId][cameraId+'-shared'];
      }
    }
    else if (role === 'viewer') {
      var video = sessions[sessionId][cameraId];
      if (video) {
        console.log('  [VideoManager] Stopping viewer [', sessionId, '][', cameraId,']');
        await video.stop();
        delete sessions[sessionId][cameraId];
      }
    }
  }
  catch (err) {
    console.log("  [VideoManager] Stop error => ", err);
  }
}

let stopAll = function() {
  console.log('  [Video/x] Stopping everything! ');

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
    console.log("  [VideoManager] Available sessions are =>");
    let sessionMainKeys = Object.keys(sessions);
    for (var k in sessions) {
      if(typeof sessions[k] !== 'undefined' && sessions[k]) {
        console.log('  [VideoManager] Session[', k,'] => ', Object.keys(sessions[k]));
      }
    }
  }
}

process.on('SIGTERM', stopAll);
process.on('SIGINT', stopAll);
