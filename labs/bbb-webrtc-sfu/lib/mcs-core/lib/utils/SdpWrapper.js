/**
 * @classdesc
 * Utils class for manipulating SDP
 */

'use strict'

var config = require('config');
var transform = require('sdp-transform');

module.exports = class SdpWrapper {
  constructor(sdp) {
    this._plainSdp = sdp;
    this._jsonSdp = transform.parse(sdp);
    this._mediaLines = {};
    this._mediaCapabilities = {};
    this._profileThreshold = "ffffff";
    this.processSdp();
  }

  get plainSdp() {
    return this._plainSdp;
  }

  get jsonSdp() {
    return this._jsonSdp;
  }

  removeFmtp () {
    return this._plainSdp.replace(/(a=fmtp:).*/g, '');
  }

  replaceServerIpv4 (ipv4) {
    return this._plainSdp.replace(/(IP4\s[0-9.]*)/g, 'IP4 ' + ipv4);
  }

  hasAudio () {
    return this._mediaCapabilities.hasAudio;
  }

  hasVideo () {
    return this._mediaCapabilities.hasVideo;
  }

  hasMultipleVideo () {
    return this._mediaCapabilities.hasMultipleVideo;
  }

  hasAvailableVideoCodec () {
    return this._mediaCapabilities.hasAvailableVideoCodec;
  }

  hasAvailableAudioCodec () {
    return this._mediaCapabilities.hasAvailableAudioCodec;
  }

  /**
   * Given a SDP, test if there is an audio description in it
   * @return {boolean}    true if there is more than one video description, else false
   */
  _hasAudio () {
    return /(m=audio)/i.test(this._plainSdp);
  }

  /**
   * Given a SDP, test if there is a video description in it
   * @return {boolean}    true if there is a video description, else false
   */
  _hasVideo () {
    return /(m=video)/i.test(this._plainSdp);
  }

  /**
   * Given a SDP, test if there is more than on video description
   * @return {boolean}    true if there is more than one video description, else false
   */
  _hasMultipleVideo () {
    return /(m=video)([\s\S]*\1){1,}/i.test(this._plainSdp);
  }

  /**
   * Tests if the current SDP has an available and valid video codec
   * @return {boolean} true if there is an RTP video session specified and active
   */
  _hasAvailableVideoCodec () {
    return this._jsonSdp.media.some((ml) => {
      let  { type, rtp, port } = ml;
      return type === 'video' && rtp && rtp.length > 0 && port !== 0;
    });
  }

  /**
   * Tests if the current SDP has an available and valid audio codec
   * @return {boolean} true if there is an RTP audio session specified and active
   */
  _hasAvailableAudioCodec () {
    return this._jsonSdp.media.some((ml) => {
      let  { type, rtp, port } = ml;
      return type === 'audio' && rtp && rtp.length > 0 && port !== 0;
    });
  }

  /**
   * Given a SDP, return its Session Description
   * @param  {string} sdp The Session Descriptor
   * @return {string}     Session description (SDP until the first media line)
   */
  getSessionDescription (sdp) {
    return sdp.match(/[\s\S]+?(?=m=audio|m=video)/i);
  }

  removeSessionDescription (sdp) {
    return sdp.match(/(?=[\s\S]+?)(m=audio[\s\S]+|m=video[\s\S]+)/i)[1];
  }

  getVideoParameters (sdp) {
    var res = transform.parse(sdp);
    var params = {};
    params.fmtp = "";
    params.codecId = 96;
    var pt = 0;
    for(var ml of res.media) {
      if(ml.type == 'video') {
        if (typeof ml.fmtp[0] != 'undefined' && ml.fmtp) {
          params.codecId = ml.fmtp[0].payload;
          params.fmtp = ml.fmtp[0].config;
          return params;
        }
      }
    }
    return params;
  }

  /**
   * Given a SDP, return its Content Description
   * @param  {string} sdp The Session Descriptor
   * @return {string}     Content Description (SDP after first media description)
   */
  getContentDescription (sdp) {
    var res = transform.parse(sdp);
    res.media = res.media.filter(function (ml) { return ml.type == "video" });
    var mangledSdp = transform.write(res);
    if(typeof mangledSdp != undefined && mangledSdp && mangledSdp != "") {
      return mangledSdp;
    }
    else
      return sdp;
  }

  /**
   * Given a SDP, return its first Media Description
   * @param  {string} sdp The Session Descriptor
   * @return {string}     Content Description (SDP after first media description)
   */
  getAudioDescription (sdp) {
    var res = transform.parse(sdp);
    res.media = res.media.filter(function (ml) { return ml.type == "audio" });
    // Hack: Some devices (Snom, Pexip) send crypto with RTP/AVP
    // That is forbidden according to RFC3711 and FreeSWITCH rebukes it
    res = this.removeTransformCrypto(res);
    var mangledSdp = transform.write(res);
    this.getSessionDescription(mangledSdp);
    if(typeof mangledSdp != undefined && mangledSdp && mangledSdp != "") {
      return mangledSdp;
    }
    else {
      return sdp;
    }
  }

  /**
   * Given a SDP, return its first Media Description
   * @param  {string} sdp The Session Descriptor
   * @return {string}     Content Description (SDP after first media description)
   */
  getMainDescription () {
    var res = transform.parse(this._plainSdp);
    // Filter should also carry && ml.invalid[0].value != 'content:slides';
    // when content is enabled
    res.media = res.media.filter(function (ml) { return ml.type == "video"}); //&& ml.invalid[0].value != 'content:slides'});
    var mangledSdp = transform.write(res);
    if (typeof mangledSdp != undefined && mangledSdp && mangledSdp != "") {
      return mangledSdp;
    }
    else {
      return sdp;
    }
  }

  /**
   * Given a JSON SDP, remove associated crypto 'a=' lines from media lines
   * WARNING: HACK MADE FOR FreeSWITCH ~1.4 COMPATIBILITY
   * @param  {Object} sdp The Session Descriptor JSON
   * @return {Object}     JSON SDP without crypto lines
   */
  removeTransformCrypto (sdp) {
    for(var ml of sdp.media) {
      delete ml['crypto'];
    }
    return sdp;
  }

  removeHighQualityFmtps (sdp) {
    let res = transform.parse(sdp);
    let maxProfileLevel = config.get('kurento.maximum_profile_level_hex');
    let pt = 0;
    let idx = 0;
    for(var ml of res.media) {
      if(ml.type == 'video') {
        for(var fmtp of ml.fmtp) {
          let fmtpConfig = transform.parseParams(fmtp.config);
          let profileId = fmtpConfig['profile-level-id'];
          if(typeof profileId !== 'undefined' && parseInt(profileId, 16) > parseInt(maxProfileLevel, 16)) {
            pt = fmtp.payload;
            delete ml.fmtp[idx];
            ml.rtp = ml.rtp.filter((rtp) => { return rtp.payload != pt});
          }
          else {
            // Remove fmtp further specifications
            //let configProfile = "profile-level-id="+profileId;
            //fmtp.config = configProfile;
          }
          idx++;
        }
      }
    }
    var mangledSdp = transform.write(res);
    return mangledSdp;
  }

  processSdp () {
    let description = this._plainSdp;

    description = description.toString().replace(/telephone-event/, "TELEPHONE-EVENT");

    this._mediaCapabilities.hasVideo = this._hasVideo();
    this._mediaCapabilities.hasAudio = this._hasAudio();
    this._mediaCapabilities.hasContent = this._hasMultipleVideo();
    this._mediaCapabilities.hasAvailableVideoCodec = this._hasAvailableVideoCodec();
    this._mediaCapabilities.hasAvailableAudioCodec = this._hasAvailableAudioCodec();
    this.sessionDescriptionHeader = this.getSessionDescription(description);
    this.audioSdp =  this.getAudioDescription(description);
    this.mainVideoSdp = this.getMainDescription(description);
    this.contentVideoSdp = this.getContentDescription(description);

    return;
  }

  /* DEVELOPMENT METHODS */
  _disableMedia  (sdp) {
    return sdp.replace(/(m=application\s)\d*/g, "$10");
  };

  /**
   * Given a SDP, add Floor Control response
   * @param  {string} sdp The Session Descriptor
   * @return {string}     A new Session Descriptor with Floor Control
   */
  _addFloorControl (sdp) {
    return sdp.replace(/a=inactive/i, 'a=sendrecv\r\na=floorctrl:c-only\r\na=setup:active\r\na=connection:new');
  }

  /**
   * Given a SDP, add Floor Control response to reinvite
   * @param  {string} sdp The Session Descriptor
   * @return {string}     A new Session Descriptor with Floor Control Id
   */
  _addFloorId (sdp) {
    sdp = sdp.replace(/(a=floorctrl:c-only)/i, '$1\r\na=floorid:1 m-stream:3');
    return sdp.replace(/(m=video.*)([\s\S]*?m=video.*)([\s\S]*)/i, '$1\r\na=content:main\r\na=label:1$2\r\na=content:slides\r\na=label:3$3');
  }

  /**
   * Given the string representation of a Session Descriptor, remove it's video
   * @param  {string} sdp The Session Descriptor
   * @return {string}     A new Session Descriptor without the video
   */
  _removeVideoSdp  (sdp) {
    return sdp.replace(/(m=video[\s\S]+)/g,'');
  };
};
