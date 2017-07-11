
/*
 * 
 */

var inherits = require('inherits');
var OutMessage = require('../OutMessage');

module.exports = function (Constants) {
  function DeskShareStartRTMPBroadcastEventMessage (conferenceName, streamUrl, timestamp) {
    DeskShareStartRTMPBroadcastEventMessage.super_.call(this, Constants.DESKSHARE_START_BROADCAST_EVENT);

    this.payload = {};
    this.payload[Constants.CONFERENCE_NAME] = conferenceName;
    this.payload[Constants.STREAM_URL] = streamUrl;
    this.payload[Constants.TIMESTAMP] = timestamp;
  };

  inherits(DeskShareStartRTMPBroadcastEventMessage, OutMessage);
  return DeskShareStartRTMPBroadcastEventMessage;
}
