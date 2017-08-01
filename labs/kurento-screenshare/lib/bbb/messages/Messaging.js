var Constants = require('./Constants.js');

// Messages

var OutMessage = require('./OutMessage.js');

var StartTranscoderRequestMessage =
    require('./transcode/StartTranscoderRequestMessage.js')(Constants);
var StopTranscoderRequestMessage =
    require('./transcode/StopTranscoderRequestMessage.js')(Constants);
var StartTranscoderSysReqMsg =
    require('./transcode/StartTranscoderSysReqMsg.js')();
var StopTranscoderSysReqMsg =
    require('./transcode/StopTranscoderSysReqMsg.js')();
var DeskShareRTMPBroadcastStartedEventMessage =
    require('./screenshare/DeskShareRTMPBroadcastStartedEventMessage.js')(Constants);
var DeskShareRTMPBroadcastStoppedEventMessage =
    require('./screenshare/DeskShareRTMPBroadcastStoppedEventMessage.js')(Constants);
var ScreenshareRTMPBroadcastStartedEventMessage2x =
    require('./screenshare/ScreenshareRTMPBroadcastStartedEventMessage2x.js')(Constants);
var ScreenshareRTMPBroadcastStoppedEventMessage2x =
    require('./screenshare/ScreenshareRTMPBroadcastStoppedEventMessage2x.js')(Constants);


 /**
  * @classdesc
  * Messaging utils to assemble JSON/Redis BigBlueButton messages 
  * @constructor
  */
function Messaging() {}

Messaging.prototype.generateStartTranscoderRequestMessage =
  function(meetingId, transcoderId, params) {
  var statrm = new StartTranscoderSysReqMsg(meetingId, transcoderId, params);
  return statrm.toJson();
}

Messaging.prototype.generateStopTranscoderRequestMessage =
  function(meetingId, transcoderId) {
  var stotrm = new StopTranscoderSysReqMsg(meetingId, transcoderId);
  return stotrm.toJson();
}

Messaging.prototype.generateDeskShareRTMPBroadcastStartedEvent =
  function(conferenceName, streamUrl, vw, vh, timestamp) {
  var stadrbem = new DeskShareRTMPBroadcastStartedEventMessage(conferenceName, streamUrl, vw, vh, timestamp);
  return stadrbem.toJson();
}

Messaging.prototype.generateDeskShareRTMPBroadcastStoppedEvent =
  function(conferenceName, streamUrl, vw, vh, timestamp) {
  var stodrbem = new DeskShareRTMPBroadcastStoppedEventMessage(conferenceName, streamUrl, vw, vh, timestamp);
  return stodrbem.toJson();
}

Messaging.prototype.generateScreenshareRTMPBroadcastStartedEvent2x =
  function(conferenceName, screenshareConf, streamUrl, vw, vh, timestamp) {
  var stadrbem = new ScreenshareRTMPBroadcastStartedEventMessage2x(conferenceName, screenshareConf, streamUrl, vw, vh, timestamp);
  return stadrbem.toJson();
}

Messaging.prototype.generateScreenshareRTMPBroadcastStoppedEvent2x =
  function(conferenceName, screenshareConf, streamUrl, vw, vh, timestamp) {
  var stodrbem = new ScreenshareRTMPBroadcastStoppedEventMessage2x(conferenceName, screenshareConf, streamUrl, vw, vh, timestamp);
  return stodrbem.toJson();
}

module.exports = new Messaging();
module.exports.Constants = Constants;
