/*
 * 
 */

var inherits = require('inherits');
var OutMessage = require('../OutMessage');

module.exports = function (Constants) {
  function StartTranscoderRequestMessage (meetingId, transcoderId, params) {
    StartTranscoderRequestMessage.super_.call(this, Constants.START_TRANSCODER_REQUEST);

    this.payload = {};
    this.payload[Constants.MEETING_ID] = meetingId;
    this.payload[Constants.TRANSCODER_ID] = transcoderId;
    this.payload[Constants.PARAMS] = params;
  };

  inherits(StartTranscoderRequestMessage, OutMessage);
  return StartTranscoderRequestMessage;
}
