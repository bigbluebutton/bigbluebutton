/*
 * 
 */

var inherits = require('inherits');
var OutMessage2x = require('../OutMessage2x');

module.exports = function (C) {
  function ScreenshareRTMPBroadcastStartedEventMessage2x (conferenceName, screenshareConf,
      streamUrl, vw, vh, timestamp) {
    ScreenshareRTMPBroadcastStartedEventMessage2x.super_.call(this, C.SCREENSHARE_RTMP_BROADCAST_STARTED_2x,
        {voiceConf: conferenceName}, {voiceConf: conferenceName});

    this.core.body = {};
    this.core.body[C.CONFERENCE_NAME] = conferenceName;
    this.core.body[C.SCREENSHARE_CONF] = screenshareConf; 
    this.core.body[C.STREAM_URL] = streamUrl;
    this.core.body[C.VIDEO_WIDTH] = vw;
    this.core.body[C.VIDEO_HEIGHT] = vh;
    this.core.body[C.TIMESTAMP] = timestamp;
  };

  inherits(ScreenshareRTMPBroadcastStartedEventMessage2x, OutMessage2x);
  return ScreenshareRTMPBroadcastStartedEventMessage2x;
}
