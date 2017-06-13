var config = require('config');
var Constants = require('./bbb/messages/Constants');

module.exports.generateSdp = function(remote_ip_address, remote_video_port) {
  return "v=0\r\n"
    + "o=- 0 0 IN IP4 " + remote_ip_address + "\r\n"
    + "s=Kurento-SCREENSHARE\r\n"
    + "c=IN IP4 " + remote_ip_address + "\r\n"
    + "t=0 0\r\n"
    + "m=video " + remote_video_port + " RTP/AVP 96\r\n"
    + "a=rtpmap:96 H264/90000\r\n"
    + "a=ftmp:96\r\n";
}

module.exports.generateVideoSdp = function (sourceIpAddress, sourceVideoPort, codecId, sendReceive, rtpProfile, codecName, codecRate, fmtp) {
    return 'm=video ' + sourceVideoPort + ' ' + rtpProfile + ' ' + codecId + '\r\n'
    + 'a=' + sendReceive + '\r\n'
    + 'c=IN IP4 ' + sourceIpAddress + '\r\n'
    + 'a=rtpmap:' + codecId + ' ' + codecName + '/' + codecRate + '\r\n'
    + 'a=fmtp:' + codecId + ' ' + fmtp + '\r\n';
};

module.exports.generateTranscoderParams = function (localIp, destIp, sendPort, recvPort, input, streamType, transcoderType, codec, callername) {
  var rtpParams = {};
  rtpParams[Constants.LOCAL_IP_ADDRESS] = localIp;
  rtpParams[Constants.LOCAL_VIDEO_PORT] = sendVideoPort;
  rtpParams[Constants.DESTINATION_IP_ADDRESS] = destIp;
  rtpParams[Constants.REMOTE_VIDEO_PORT] = recvPort;
  rtpParams[Constants.INPUT] = input;
  rtpParams[Constants.STREAM_TYPE] = streamType;
  rtpParams[Constants.TRANSCODER_TYPE] = transcoderType;
  rtpParams[Constants.TRANSCODER_CODEC] = codec;
  rtpParams[Constants.CALLERNAME] = callername;
  return rtpParams;
}

module.exports.getPort = function (min_port, max_port) {
  return Math.floor((Math.random() * (max_port - min_port + 1) + min_port));
}

module.exports.getVideoPort = function () {
  return this.getPort(config.get('minVideoPort'), config.get('maxVideoPort'));
}
