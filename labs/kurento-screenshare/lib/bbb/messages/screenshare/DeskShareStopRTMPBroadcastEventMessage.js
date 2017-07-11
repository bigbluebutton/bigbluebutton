/*
 * 
 */

var inherits = require('inherits');
var OutMessage = require('../OutMessage');

module.exports = function (Constants) {
  function DeskShareStopRTMPBroadcastEventMessage (conferenceName, streamUrl, timestamp) {
    DeskShareStopRTMPBroadcastEventMessage.super_.call(this, Constants.DESKSHARE_STOP_BROADCAST_EVENT);

    this.payload = {};
    this.payload[Constants.CONFERENCE_NAME] = conferenceName;
    this.payload[Constants.STREAM_URL] = streamUrl;
    this.payload[Constants.TIMESTAMP] = timestamp;
  };

  inherits(DeskShareStopRTMPBroadcastEventMessage, OutMessage);
  return DeskShareStopRTMPBroadcastEventMessage;
}
