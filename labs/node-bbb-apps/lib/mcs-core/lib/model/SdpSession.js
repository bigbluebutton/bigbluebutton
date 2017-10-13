/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const C = require('../constants/Constants');
const SdpWrapper = require('../utils/SdpWrapper');
const uuidv4 = require('uuid/v4');
const EventEmitter = require('events').EventEmitter;
const MediaServer = require('../media/media-server');

module.exports = class SdpSession extends EventEmitter {
  constructor(sdp = null, type = C.MEDIA_TYPE.RTP) {
    super();
    this.id = uuidv4();
    this._status = C.STATUS.STOPPED;
    this._type = type;
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

  async start (sdpId) {
    this._status = C.STATUS.STARTING;
    try {
      console.log("[mcs] start/cme");
      const mediaElement = await MediaServer.createMediaElement(this.id, this._type);
      console.log("[mcs] start/po " + mediaElement);
      const answer = await MediaServer.processOffer(mediaElement, this._sdp.getMainDescription()); 
      Promise.resolve(answer);
    }
    catch (err) {
      this.handleError(err);
      Promise.reject(err);
    }
  }

  // TODO move to parent Session
  async stop () {
    this._status = C.STATUS.STOPPING;
    try {
      await MediaServer.stop(this.id);
      this._status = C.STATUS.STOPPED;
      Promise.resolve();
    }
    catch (err) {
      this.handleError(err);
      Promise.reject(err);
    }
  }


  // TODO move to parent Session
  async connect (sinkId) {
    try {
      await MediaServer.connect(this.id, sinkId);
      Promise.resolve();
    }
    catch (err) {
      this.handleError(err);
      Promise.reject(err);
    }
  }

  handleError (err) {
    console.log(err);
    this._status = C.STATUS.STOPPED;
  }
}
