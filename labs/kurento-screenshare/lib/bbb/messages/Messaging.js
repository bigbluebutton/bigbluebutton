var Constants = require('./Constants.js');

// Messages

var OutMessage = require('./OutMessage.js');

var StartTranscoderRequestMessage =
    require('./transcode/StartTranscoderRequestMessage.js')(Constants);
var StopTranscoderRequestMessage =
    require('./transcode/StopTranscoderRequestMessage.js')(Constants);
var DeskShareRTMPBroadcastStartedEventMessage =
    require('./screenshare/DeskShareRTMPBroadcastStartedEventMessage.js')(Constants);
var DeskShareRTMPBroadcastStoppedEventMessage =
    require('./screenshare/DeskShareRTMPBroadcastStoppedEventMessage.js')(Constants);

 /**
  * @classdesc
  * Messaging utils to assemble JSON/Redis BigBlueButton messages 
  * @constructor
  */
function Messaging() {}

Messaging.prototype.generateStartTranscoderRequestMessage =
  function(meetingId, transcoderId, params) {
  var statrm = new StartTranscoderRequestMessage(meetingId, transcoderId, params);
  return statrm.toJson();
}

Messaging.prototype.generateStopTranscoderRequestMessage =
  function(meetingId, transcoderId) {
  var stotrm = new StopTranscoderRequestMessage(meetingId, transcoderId);
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

module.exports = new Messaging();
module.exports.Constants = Constants;
