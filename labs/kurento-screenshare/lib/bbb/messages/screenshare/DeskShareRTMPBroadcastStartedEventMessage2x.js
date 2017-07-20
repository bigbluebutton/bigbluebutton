/*
 * 
 */

var inherits = require('inherits');
var OutMessage2x = require('../OutMessage2x');

module.exports = function (C) {
  function DeskShareRTMPBroadcastStartedEventMessage2x (conferenceName, screenshareConf,
      streamUrl, vw, vh, timestamp) {
    DeskShareRTMPBroadcastStartedEventMessage2x.super_.call(this, C.DESKSHARE_RTMP_BROADCAST_STARTED_2x,
        {voiceConf: conferenceName}, {voiceConf: conferenceName});

    this.core.body = {};
    this.core.body[C.CONFERENCE_NAME] = conferenceName;
    this.core.body[C.SCREENSHARE_CONF] = screenshareConf; 
    this.core.body[C.STREAM_URL] = streamUrl;
    this.core.body[C.VIDEO_WIDTH] = vw;
    this.core.body[C.VIDEO_HEIGHT] = vh;
    this.core.body[C.TIMESTAMP] = timestamp;
  };

  inherits(DeskShareRTMPBroadcastStartedEventMessage2x, OutMessage2x);
  return DeskShareRTMPBroadcastStartedEventMessage2x;
}
