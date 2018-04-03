/*
 * 
 */

var inherits = require('inherits');
var OutMessage2x = require('../OutMessage2x');

module.exports = function (C) {
  function UserCamBroadcastStoppedEventMessage2x (meetingId, userId, stream) {
    UserCamBroadcastStoppedEventMessage2x.super_.call(this, C.USER_CAM_BROADCAST_STOPPED_2x, {sender: 'bbb-webrtc-sfu'}, {meetingId, userId});

    this.core.body = {};
    this.core.body[C.STREAM_URL] = stream; 
  };

  inherits(UserCamBroadcastStoppedEventMessage2x, OutMessage2x);
  return UserCamBroadcastStoppedEventMessage2x;
}
