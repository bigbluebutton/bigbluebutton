/*
 * 
 */

var inherits = require('inherits');
var OutMessage = require('../OutMessage');

module.exports = function (Constants) {
  function DeskShareRTMPBroadcastStoppedEventMessage (conferenceName, streamUrl, vw, vh, timestamp) {
    DeskShareRTMPBroadcastStoppedEventMessage.super_.call(this, Constants.DESKSHARE_RTMP_BROADCAST_STOPPED);

    this.payload = {};
    this.payload[Constants.CONFERENCE_NAME] = conferenceName;
    this.payload[Constants.STREAM_URL] = streamUrl;
    this.payload[Constants.TIMESTAMP] = timestamp;
    this.payload[Constants.VIDEO_WIDTH] = vw;
    this.payload[Constants.VIDEO_HEIGHT] = vh;
  };

  inherits(DeskShareRTMPBroadcastStoppedEventMessage, OutMessage);
  return DeskShareRTMPBroadcastStoppedEventMessage;
}
