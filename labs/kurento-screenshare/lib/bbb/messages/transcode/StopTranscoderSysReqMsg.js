var inherits = require('inherits');
var OutMessage2x = require('../OutMessage2x');

module.exports = function() {
  function StopTranscoderSysReqMsg(meetingId, transcoderId) {
    StopTranscoderSysReqMsg.super_.call(this, "StopTranscoderSysReqMsg",
        {sender: "kurento-screenshare"},
        {meetingId: meetingId});

    this.core.body = {};
    this.core.body["transcoderId"] = transcoderId;
  };

  inherits(StopTranscoderSysReqMsg, OutMessage2x);
  return StopTranscoderSysReqMsg;
}