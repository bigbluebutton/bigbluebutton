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

  if (!sessions[sessionId]) {
    sessions[sessionId] = {};
  }

  if (message.cameraId && sessions[sessionId][message.cameraId]) {
    video = sessions[sessionId][message.cameraId];
  }

  switch (message.id) {
    case 'start':

      console.log('[' + message.id + '] connection ' + sessionId);
      let role = message.cameraShared? 'share' : 'view';

      video = new Video(bbbGW, message.cameraId, message.cameraShared, message.connectionId);
      sessions[sessionId][message.cameraId] = video;

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

      if (video) {
        video.stop(sessionId);
      } else {
        console.log(" [stop] Why is there no video on STOP?");
      }
      break;

    case 'onIceCandidate':

      if (video) {
        video.onIceCandidate(message.candidate);
      } else {
        console.log(" [iceCandidate] Why is there no video on ICE CANDIDATE?");
      }
      break;

    case 'close':
      console.log(" CASE CLOSED");

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

let stopSession = function(sessionId) {
  console.log('  [VideoManager/x] Stopping session ' + sessionId);
  let videoIds = Object.keys(sessions[sessionId]);

  for (var i = 0; i < videoIds.length; i++) {
    var video = sessions[sessionId][videoIds[i]];
    video.stop();
    sessions[sessionId][videoIds[i]] = null;
  }

  sessions[sessionId] = null;
}

let stopAll = function() {
  console.log('  [Video/x] Stopping everything! ');
  let sessionIds = Object.keys(sessions);

  for (var i = 0; i < sessionIds.length; i++) {

    stopSession(sessionIds[i]);
  }

  setTimeout(process.exit, 100);
}

process.on('SIGTERM', stopAll);
process.on('SIGINT', stopAll);
