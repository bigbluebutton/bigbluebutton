var inherits = require('inherits');
var OutMessage = require('../OutMessage');

module.exports = function (Constants) {
  function StopTranscoderRequestMessage (meetingId, transcoderId) {
    StopTranscoderRequestMessage.super_.call(this, Constants.STOP_TRANSCODER_REQUEST);

    this.payload = {};
    this.payload[Constants.MEETING_ID] = meetingId;
    this.payload[Constants.TRANSCODER_ID] = transcoderId;
  };

  inherits(StopTranscoderRequestMessage, OutMessage);
  return StopTranscoderRequestMessage;
}
