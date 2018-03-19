const Constants = require('./Constants.js');

// Messages

let OutMessage = require('./OutMessage.js');

let StartTranscoderRequestMessage =
    require('./transcode/StartTranscoderRequestMessage.js')(Constants);
let StopTranscoderRequestMessage =
    require('./transcode/StopTranscoderRequestMessage.js')(Constants);
let StartTranscoderSysReqMsg =
    require('./transcode/StartTranscoderSysReqMsg.js')();
let StopTranscoderSysReqMsg =
    require('./transcode/StopTranscoderSysReqMsg.js')();
let DeskShareRTMPBroadcastStartedEventMessage =
    require('./screenshare/DeskShareRTMPBroadcastStartedEventMessage.js')(Constants);
let DeskShareRTMPBroadcastStoppedEventMessage =
    require('./screenshare/DeskShareRTMPBroadcastStoppedEventMessage.js')(Constants);
let ScreenshareRTMPBroadcastStartedEventMessage2x =
    require('./screenshare/ScreenshareRTMPBroadcastStartedEventMessage2x.js')(Constants);
let ScreenshareRTMPBroadcastStoppedEventMessage2x =
    require('./screenshare/ScreenshareRTMPBroadcastStoppedEventMessage2x.js')(Constants);
let UserCamBroadcastStoppedEventMessage2x =
    require('./video/UserCamBroadcastStoppedEventMessage2x.js')(Constants);

 /**
  * @classdesc
  * Messaging utils to assemble JSON/Redis BigBlueButton messages
  * @constructor
  */
function Messaging() {}

Messaging.prototype.generateStartTranscoderRequestMessage =
  function(meetingId, transcoderId, params) {
  let statrm = new StartTranscoderSysReqMsg(meetingId, transcoderId, params);
  return statrm.toJson();
}

Messaging.prototype.generateStopTranscoderRequestMessage =
  function(meetingId, transcoderId) {
  let stotrm = new StopTranscoderSysReqMsg(meetingId, transcoderId);
  return stotrm.toJson();
}

Messaging.prototype.generateDeskShareRTMPBroadcastStartedEvent =
  function(conferenceName, streamUrl, vw, vh, timestamp) {
  let stadrbem = new DeskShareRTMPBroadcastStartedEventMessage(conferenceName, streamUrl, vw, vh, timestamp);
  return stadrbem.toJson();
}

Messaging.prototype.generateDeskShareRTMPBroadcastStoppedEvent =
  function(conferenceName, streamUrl, vw, vh, timestamp) {
  let stodrbem = new DeskShareRTMPBroadcastStoppedEventMessage(conferenceName, streamUrl, vw, vh, timestamp);
  return stodrbem.toJson();
}

Messaging.prototype.generateScreenshareRTMPBroadcastStartedEvent2x =
  function(conferenceName, screenshareConf, streamUrl, vw, vh, timestamp) {
  let stadrbem = new ScreenshareRTMPBroadcastStartedEventMessage2x(conferenceName, screenshareConf, streamUrl, vw, vh, timestamp);
  return stadrbem.toJson();
}

Messaging.prototype.generateScreenshareRTMPBroadcastStoppedEvent2x =
  function(conferenceName, screenshareConf, streamUrl, vw, vh, timestamp) {
  let stodrbem = new ScreenshareRTMPBroadcastStoppedEventMessage2x(conferenceName, screenshareConf, streamUrl, vw, vh, timestamp);
  return stodrbem.toJson();
}

Messaging.prototype.generateUserCamBroadcastStoppedEventMessage2x =
  function(meetingId, userId, streamUrl) {
  let stodrbem = new UserCamBroadcastStoppedEventMessage2x(meetingId, userId, streamUrl);
  return stodrbem.toJson();
}

module.exports = new Messaging();
