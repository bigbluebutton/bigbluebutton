/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const C = require('../constants/Constants');
const SdpWrapper = require('../utils/SdpWrapper');
const rid = require('readable-id');
const MediaServer = require('../media/media-server');
const MediaSession = require('./MediaSession');
const config = require('config');
const kurentoUrl = config.get('kurentoUrl');
const kurentoIp = config.get('kurentoIp');
const Logger = require('../../../utils/Logger');

module.exports = class SdpSession extends MediaSession {
  constructor(emitter, sdp = null, room, type = 'WebRtcEndpoint', options) {
    super(emitter, room, type, options);
    Logger.info("[mcs-sdp-session] New session with options", options);
    // {SdpWrapper} SdpWrapper
    this._sdp;
    if (sdp && type) {
      this.setSdp(sdp, type);
    }
  }

  async setSdp (sdp, type) {
    this._sdp = new SdpWrapper(sdp, type);
    await this._sdp.processSdp();
  }

  process () {
    return new Promise(async (resolve, reject) => {
      try {
        const answer = await this._MediaServer.processOffer(this._mediaElement, this._sdp.getPlainSdp());

        if (this._type != 'WebRtcEndpoint') {
          this._sdp.replaceServerIpv4(kurentoIp);
          return resolve(answer);
        }

        await this._MediaServer.gatherCandidates(this._mediaElement);
        resolve(answer);
      }
      catch (err) {
        return reject(this._handleError(err));
      }
    });
  }

  addIceCandidate (candidate) {
    return new Promise(async (resolve, reject) => {
      try {
        await this._MediaServer.addIceCandidate(this._mediaElement, candidate);
        resolve();
      }
      catch (err) {
        return reject(this._handleError(err));
      }
    });
  }
}
