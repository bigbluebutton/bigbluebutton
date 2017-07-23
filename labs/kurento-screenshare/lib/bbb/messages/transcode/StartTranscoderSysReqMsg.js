var inherits = require('inherits');
var OutMessage2x = require('../OutMessage2x');

module.exports = function() {
  function StartTranscoderSysReqMsg(meetingId, transcoderId, params) {
    StartTranscoderSysReqMsg.super_.call(this, "StartTranscoderSysReqMsg",
        {sender: "kurento-screenshare"},
        {meetingId: meetingId});

    this.core.body = {};
    this.core.body["transcoderId"] = transcoderId;
    this.core.body["params"] = params;
  };

  inherits(StartTranscoderSysReqMsg, OutMessage2x);
  return StartTranscoderSysReqMsg;
}