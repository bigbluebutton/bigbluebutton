/**
 * @classdesc
 * Utils class for SDP generation
 */

module.exports.generateSdp = function(remote_ip_address, remote_video_port) {
  return "v=0\r\n"
    + "o=- 0 0 IN IP4 " + remote_ip_address + "\r\n"
    + "s=No Name\r\n"
    + "c=IN IP4 " + remote_ip_address + "\r\n"
    + "t=0 0\r\n"
    + "m=video " + remote_video_port + " RTP/AVP 96\r\n"
    + "a=rtpmap:96 H264/90000\r\n"
    + "a=ftmp:96 packetization-mode=0\r\n";
}

/**
 * Generates a video SDP given the media specs
 * @param  {string} sourceIpAddress The source IP address of the media
 * @param  {string} sourceVideoPort The source video port of the media
 * @param  {string} codecId         The ID of the codec
 * @param  {string} sendReceive     The SDP flag of the media flow
 * direction, 'sendonly', 'recvonly' or 'sendrecv'
 * @param {String} rtpProfile       The RTP profile of the RTP Endpoint
 * @param {String} codecName        The name of the codec used for the RTP
 * Endpoint
 * @param {String} codecRate        The codec rate
 * @return {string}                 The Session Descriptor for the media
 */
module.exports.generateVideoSdp = function (sourceIpAddress, sourceVideoPort, codecId, sendReceive, rtpProfile, codecName, codecRate, fmtp) {
  return 'm=video ' + sourceVideoPort + ' ' + rtpProfile + ' ' + codecId + '\r\n'
    + 'a=' + sendReceive + '\r\n'
    + 'c=IN IP4 ' + sourceIpAddress + '\r\n'
    + 'a=rtpmap:' + codecId + ' ' + codecName + '/' + codecRate + '\r\n'
    + 'a=fmtp:' + codecId + ' ' + fmtp + '\r\n';
};

