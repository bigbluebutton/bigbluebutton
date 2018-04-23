/*
 * 
 */

var inherits = require('inherits');
var OutMessage = require('../OutMessage');
var hrTime = require('../../../utils/Utils').hrTime;

module.exports = function (C) {
  function StopWebcamShareEvent (meetingId, stream) {
    StopWebcamShareEvent.super_.call(this, C.STOP_WEBCAM_SHARE);

    let date = new Date();
    let timestamp = hrTime();

    this.payload = {};
    this.payload[C.MODULE] = C.WEBCAM_MODULE;
    this.payload[C.MEETING_ID] = meetingId;
    this.payload[C.TIMESTAMP] = timestamp;
    this.payload[C.DATE] = date;
    this.payload[C.TIMESTAMP_UTC] = date.getTime() ;
    this.payload[C.STREAM_URL] = stream; 
    this.payload[C.DURATION] = 0;
  };

  inherits(StopWebcamShareEvent, OutMessage);
  return StopWebcamShareEvent;
}
