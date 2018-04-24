/*
 * 
 */

var hrTime = require('../../../utils/Utils').hrTime;

module.exports = function (C) {
  function StartWebcamShareEvent (meetingId, filename) {

    let date = new Date();
    let timestamp = hrTime();

    this.payload = {};
    this.payload[C.EVENT_NAME] = C.START_WEBCAM_SHARE;
    this.payload[C.MODULE] = C.MODULE_WEBCAM;
    this.payload[C.MEETING_ID] = meetingId;
    this.payload[C.TIMESTAMP] = timestamp;
    this.payload[C.TIMESTAMP_UTC] = date.getTime() ;
    this.payload[C.FILENAME] = filename;
  };

  return StartWebcamShareEvent;
}
