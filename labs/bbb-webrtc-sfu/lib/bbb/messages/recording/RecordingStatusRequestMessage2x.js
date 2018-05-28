/*
 * 
 */

var inherits = require('inherits');
var OutMessage2x = require('../OutMessage2x');

module.exports = function (C) {
  function RecordingStatusRequestMessage2x (meetingId, userId) {
    RecordingStatusRequestMessage2x.super_.call(this, C.RECORDING_STATUS_REQUEST_MESSAGE_2x, {sender: 'bbb-webrtc-sfu'}, {meetingId, userId});

    this.core.body = {};
    this.core.body[C.REQUESTED_BY] = userId;
  };

  inherits(RecordingStatusRequestMessage2x, OutMessage2x);
  return RecordingStatusRequestMessage2x;
}
