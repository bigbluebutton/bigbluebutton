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
  let role = 'view';
  let shared = false;
  let iceQueue = {};

  if (message.role == 'shared') {
    role = 'share';
    shared = true;
  }

  if (!sessions[sessionId]) {
    sessions[sessionId] = {};
  }

  if (message.cameraId && sessions[sessionId][message.cameraId]) {
    if (shared) {
      video = sessions[sessionId].shared;
    } else {
      video = sessions[sessionId][message.cameraId];
    }
  }

  switch (message.id) {
    case 'start':

      console.log('[' + message.id + '] connection ' + sessionId);

      video = new Video(bbbGW, message.cameraId, shared, message.connectionId);

      // Empty ice queue after starting video
      if (iceQueue[message.cameraId]) {
        let candidate;
        while(candidate = iceQueue[message.cameraId].pop()) {
          video.onIceCandidate(cand);
        }
      }

      if (shared) {
        sessions[sessionId].shared = video;
      } else {
        sessions[sessionId][message.cameraId] = video;
      }

      video.start(message.sdpOffer, (error, sdpAnswer) => {
        if (error) {
          return bbbGW.publish(JSON.stringify({
            connectionId: sessionId,
            type: 'video',
            role: role,
            id : 'error',
            response : 'rejected',
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

      console.log('[' + message.id + '] connection ' + sessionId);

      if (video && message.cameraId == video.id) {
        video.stop(sessionId);
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

let stopSession = function(sessionId, videoId) {
  console.log('  [VideoManager/x] Stopping session ' + sessionId);

  if (sessions == null || sessionId == null || sessions[sessionId] == null) {
    return;
  }

  let videoIds = Object.keys(sessions[sessionId]);

  for (var i = 0; i < videoIds.length; i++) {
    var video = sessions[sessionId][videoIds[i]];
    video.stop();
    sessions[sessionId][videoIds[i]] = null;
  }

  sessions[sessionId] = null;

  delete sessions[sessionId];
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

process.on('SIGTERM', stopAll);
process.on('SIGINT', stopAll);
