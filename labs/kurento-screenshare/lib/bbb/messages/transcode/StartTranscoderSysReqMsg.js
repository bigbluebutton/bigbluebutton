var inherits = require('inherits');
var OutMessage2x = require('../OutMessage2x');
var C = require('../Constants');

module.exports = function() {
  function StartTranscoderSysReqMsg(meetingId, transcoderId, params) {
    StartTranscoderSysReqMsg.super_.call(this, C.START_TRANSCODER_REQ_2x,
        {sender: "kurento-screenshare"},
        {meetingId: meetingId});

    this.core.body = {};
    this.core.body[C.TRANSCODER_ID_2x] = transcoderId;
    this.core.body[C.PARAMS] = params;
  };

  inherits(StartTranscoderSysReqMsg, OutMessage2x);
  return StartTranscoderSysReqMsg;
}
