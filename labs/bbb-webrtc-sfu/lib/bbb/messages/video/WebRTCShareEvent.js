/*
 * 
 */

var hrTime = require('../../../utils/Utils').hrTime;

module.exports = function (C) {
  function WebRTCShareEvent (name, meetingId, filename) {

    let date = new Date();
    let timestamp = hrTime();

    this.payload = {};
    this.payload[C.EVENT_NAME] = name;
    this.payload[C.MODULE] = C.MODULE_WEBCAM;
    this.payload[C.MEETING_ID] = meetingId;
    this.payload[C.TIMESTAMP] = timestamp;
    this.payload[C.TIMESTAMP_UTC] = date.getTime() ;
    this.payload[C.FILENAME] = filename;
  };

  return WebRTCShareEvent;
}
