/*
 * A module with the sole purpose of removing all non h264 options from an sdpOffer
 *
 * We use this to prevent any transcoding from the Kurento side if Firefox or Chrome offer VP8/VP9 as
 * the default format.
 */

var sdpTransform = require('sdp-transform');

exports.transform = function(sdp) {

  var mediaIndex = 0;
  var res = sdpTransform.parse(sdp);
  var validPayloads;

  if (res.media[0].type === 'audio') {
    // Audio
    res.media[mediaIndex].rtp = res.media[mediaIndex].rtp.filter(function(elem) {
      return elem.codec === 'opus';
    });

    validPayloads = res.media[mediaIndex].rtp.map(function(elem) {
      return elem.payload;
    });

    res.media[mediaIndex].fmtp = res.media[mediaIndex].fmtp.filter(function(elem) {
      return validPayloads.indexOf(elem.payload) >= 0;
    });

    res.media[mediaIndex].payloads = validPayloads.join(' ');

    mediaIndex += 1;
  }

  // Video
  res.media[mediaIndex].rtp = res.media[mediaIndex].rtp.filter(function(elem) {
    return elem.codec === 'H264';
  });

  validPayloads = res.media[mediaIndex].rtp.map(function(elem) {
    return elem.payload;
  });

  res.media[mediaIndex].fmtp = res.media[mediaIndex].fmtp.filter(function(elem) {
    return validPayloads.indexOf(elem.payload) >= 0;
  });

  res.media[mediaIndex].rtcpFb = res.media[mediaIndex].rtcpFb.filter(function(elem) {
    return validPayloads.indexOf(elem.payload) >= 0;
  });

  res.media[mediaIndex].payloads = validPayloads.join(' ');

  return sdpTransform.write(res);
};

