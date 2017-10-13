/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const User = require('./User');
const C = require('../constants/Constants');
const SdpWrapper = require('../utils/SdpWrapper');
const SdpSession = require('../model/SdpSession');
const UriSession = require('../model/UriSession');

module.exports = class SfuUser extends User {
  constructor(_roomId, type, userAgentString = C.STRING.ANONYMOUS, sdp = null, uri = null) {
    super(_roomId);
    // {SdpWrapper} SdpWrapper
    this._sdp;
    // {Object} hasAudio, hasVideo, hasContent
    this._mediaSessions = {}
    this.userAgentString;
    if (sdp) {
      this.addSdp(sdp);
    }
    if (uri) {
      this.addUri(uri);
    }
  }

  async addUri (uri, type) {
    // TODO switch from type to children UriSessions (RTSP|HTTP|etc)
    let session = new UriSession(uri, type);

    if (typeof this._mediaSessions[session.id] == 'undefined' || 
        !this._mediaSessions[session.id]) {
      this._mediaSessions[session.id] = {};
    }
    this._mediaSessions[session.id] = session; 
    try {
      await this.startSession(session.id);
      Promise.resolve(session.id);
    }
    catch (error) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  addSdp (sdp, type) {
    // TODO switch from type to children SdpSessions (WebRTC|SDP)
    let session = new SdpSession(sdp, type);

    if (typeof this._mediaSessions[session.id] == 'undefined' || 
        !this._mediaSessions[session.id]) {
      this._mediaSessions[session.id] = {};
    }
    this._mediaSessions[session.id] = session; 
    console.log("[mcs] Added SDP " + session.id);

    return session.id;
  }

  async startSession (sessionId) {
    console.log("[mcs] starting session " + sessionId);
    let session = this._mediaSessions[sessionId];
  
    try {
      const answer = await session.start();
      Promise.resolve(answer);
    }
    catch (error) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  async subscribe (sdp, mediaId) {
    let sessionId = await this.addSdp(sdp);
    try {
      await this.startSession(sessionId);
      await this.connect(sessionId, mediaId);
      Promise.resolve();
    } 
    catch (error) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  async publish (sdp, mediaId) {
    let sessionId = await this.addSdp(sdp);
    try {
      await this.startSession(sessionId);
      Promise.resolve();
    } 
    catch (error) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  async unsubscribe (sdp, mediaId) {
    try {
      await this.stopSession(sessionId);
      Promise.resolve();
    } 
    catch (error) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  async unpublish (sdp, mediaId) {
    try {
      await this.stopSession(sessionId);
      Promise.resolve();
    } 
    catch (error) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  async stopSession (sdpId) {
    let session = this._mediaSessions[sdpId];

    try {
      await session.stop();
      Promise.resolve();
    }
    catch (err) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  async connect (sourceId, sinkId) {
    let session = this._mediaSessions[sessionId];
    if(session) {
      try {
        await session.connect(sinkId);
        Promise.resolve();
      }
      catch (error) {
        this.handleError(err);
        Promise.reject(new Error(err));
      }
    }
  }

  handleError (err) {
    console.log(err);
    this._status = C.STATUS.STOPPED;
  }
}
