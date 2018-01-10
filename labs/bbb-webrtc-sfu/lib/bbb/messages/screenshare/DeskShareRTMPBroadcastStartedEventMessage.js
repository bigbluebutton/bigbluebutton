/*
 * 
 */

var inherits = require('inherits');
var OutMessage = require('../OutMessage');

module.exports = function (Constants) {
  function DeskShareRTMPBroadcastStartedEventMessage (conferenceName, streamUrl, vw, vh, timestamp) {
    DeskShareRTMPBroadcastStartedEventMessage.super_.call(this, Constants.DESKSHARE_RTMP_BROADCAST_STARTED);

    this.payload = {};
    this.payload[Constants.CONFERENCE_NAME] = conferenceName;
    this.payload[Constants.STREAM_URL] = streamUrl;
    this.payload[Constants.TIMESTAMP] = timestamp;
    this.payload[Constants.VIDEO_WIDTH] = vw;
    this.payload[Constants.VIDEO_HEIGHT] = vh;
  };

  inherits(DeskShareRTMPBroadcastStartedEventMessage, OutMessage);
  return DeskShareRTMPBroadcastStartedEventMessage;
}
