/*
 * A module with the sole purpose of removing all non h264 options from an sdpOffer
 *
 * We use this to prevent any transcoding from the Kurento side if Firefox or Chrome offer VP8/VP9 as
 * the default format.
 */

const sdpTransform = require('sdp-transform');

exports.transform = function(sdp, preferredProfile = null) {

  let mediaIndex = 0;
  let res = sdpTransform.parse(sdp);
  let validPayloads;

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
  const availablePayloads = res.media[mediaIndex].rtp.map(elem => {
    return elem.payload;
  });

  res.media[mediaIndex].rtp = res.media[mediaIndex].rtp.filter(function(elem) {
    return elem.codec === 'H264';
  });

  preferProfile(res.media[mediaIndex], preferredProfile);

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

const preferProfile = function (mediaLine, profileToFilter) {
  if (profileToFilter == null) {
    return;
  }

  const profileRegex = /(?:profile\-level\-id\=)([\d\w]*)/i;
  const validProfilePayloads = mediaLine.fmtp.filter(e => {
    let profileSpec = profileRegex.exec(e.config);
    return profileSpec && profileSpec[1] && profileSpec[1] === profileToFilter;
  }).map(e => e.payload);

  if (validProfilePayloads.length > 0) {
    mediaLine.rtp = mediaLine.rtp.filter(e => {
      return validProfilePayloads.includes(e.payload);
    });
  }
};
