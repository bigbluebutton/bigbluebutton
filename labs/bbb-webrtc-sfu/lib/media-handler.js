var config = require('config');
var Constants = require('./bbb/messages/Constants');

module.exports.generateSdp = function(remote_ip_address, remote_video_port) {
  return "v=0\r\n"
    + "o=- 0 0 IN IP4 " + remote_ip_address + "\r\n"
    + "s=Kurento-SCREENSHARE\r\n"
    + "c=IN IP4 " + remote_ip_address + "\r\n"
    + "t=0 0\r\n"
    + "m=video " + remote_video_port + " RTP/AVPF 96\r\n"
    + "a=rtpmap:96 H264/90000\r\n"
    + "a=ftmp:96\r\n";
}

module.exports.generateVideoSdp = function (sourceIpAddress, sourceVideoPort) {
    return "v=0\r\n"
    + "o=- 0 0 IN IP4 " + sourceIpAddress + "\r\n"
    + "s=Kurento-SCREENSHARE\r\n"
    + 'm=video ' + sourceVideoPort + ' ' + this.videoConfiguration.rtpProfile + ' ' + this.videoConfiguration.codecId + '\r\n'
    + 'a=' + this.videoConfiguration.sendReceive + '\r\n'
    + 'c=IN IP4 ' + sourceIpAddress + '\r\n'
    + 'a=rtpmap:' + this.videoConfiguration.codecId + ' ' + this.videoConfiguration.codecName + '/' + this.videoConfiguration.codecRate + '\r\n'
    + 'a=fmtp:' + this.videoConfiguration.codecId + '\r\n'
    + 'a=rtcp-fb:' + this.videoConfiguration.codecId + ' ccm fir \r\n'
    + 'a=rtcp-fb:' + this.videoConfiguration.codecId + ' nack \r\n'
    + 'a=rtcp-fb:' + this.videoConfiguration.codecId + ' nack pli \r\n'
    + 'a=rtcp-fb:' + this.videoConfiguration.codecId + ' goog-remb \r\n';
};

module.exports.videoConfiguration = {
    codecId: '96',
    sendReceive: 'sendrecv',
    rtpProfile: 'RTP/AVPF',
    codecName: 'H264',
    frameRate: '30.000000',
    codecRate: '90000'
};     

module.exports.generateStreamUrl = function (address, meeting, path) {
  return "rtmp://" + address + "/video-broadcast/" + meeting + "/" + path;
}

module.exports.generateTranscoderParams = function (localIp, destIp, sendPort, recvPort, input, streamType, transcoderType, codec, callername, voiceConf) {
  var rtpParams = {};
  rtpParams[Constants.LOCAL_IP_ADDRESS] = localIp;
  rtpParams[Constants.LOCAL_VIDEO_PORT] = sendPort;
  rtpParams[Constants.DESTINATION_IP_ADDRESS] = destIp;
  rtpParams[Constants.REMOTE_VIDEO_PORT] = recvPort;
  rtpParams[Constants.INPUT] = input;
  rtpParams[Constants.STREAM_TYPE] = streamType;
  rtpParams[Constants.TRANSCODER_TYPE] = transcoderType;
  rtpParams[Constants.TRANSCODER_CODEC] = codec;
  rtpParams[Constants.CALLERNAME] = callername;
  rtpParams[Constants.VOICE_CONF] = voiceConf;
  return rtpParams;
}

module.exports.getPort = function (min_port, max_port) {
  return Math.floor((Math.random() * (max_port - min_port + 1) + min_port));
}

module.exports.getVideoPort = function () {
  return this.getPort(config.get('minVideoPort'), config.get('maxVideoPort'));
}
