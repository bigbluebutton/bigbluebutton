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
  constructor(_roomId, type, emitter, userAgentString = C.STRING.ANONYMOUS, sdp = null, uri = null) {
    super(_roomId);
    // {SdpWrapper} SdpWrapper
    this._sdp;
    // {Object} hasAudio, hasVideo, hasContent
    this._mediaSessions = {}
    this.userAgentString;
    this.emitter = emitter;
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
    catch (err) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  addSdp (sdp, type) {
    // TODO switch from type to children SdpSessions (WebRTC|SDP)
    let session = new SdpSession(this.emitter, sdp, this.roomId, type);
    this.emitter.emit(C.EVENT.NEW_SESSION+this.id, session.id);
    session.on("SESSION_STOPPED", (sessId) => {
      console.log("  [SfuUser] Session ", sessId, "stopped, cleaning it...");
      if (sessId === session.id) {
        this._mediaSessions[sessId] = null;
      }
    });

    if (typeof this._mediaSessions[session.id] == 'undefined' || 
        !this._mediaSessions[session.id]) {
      this._mediaSessions[session.id] = {};
    }
    this._mediaSessions[session.id] = session; 
    console.log("[SfuUser] Added SDP " + session.id);

    return session;
  }

  async startSession (sessionId) {
    console.log("[SfuUser] starting session " + sessionId);
    let session = this._mediaSessions[sessionId];
  
    try {
      const answer = await session.start();
      return Promise.resolve(answer);
    }
    catch (err) {
      this.handleError(err);
      return Promise.reject(new Error(err));
    }
  }

  async subscribe (sdp, type,  mediaId) {
    try {
      const session = await this.addSdp(sdp, type);
      await this.startSession(session.id);
      await this.connect(session.id, mediaId);
      Promise.resolve(session);
    } 
    catch (err) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  async publish (sdp, mediaId) {
    let session = await this.addSdp(sdp);
    try {
      await this.startSession(session.id);
      Promise.resolve();
    } 
    catch (err) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  async unsubscribe (mediaId) {
    try {
      await this.stopSession(mediaId);
      Promise.resolve();
    } 
    catch (err) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  async unpublish (mediaId) {
    try {
      await this.stopSession(mediaId);
      Promise.resolve();
    } 
    catch (err) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  async stopSession (sessionId) {
    console.log("  [SfuUser] Stopping session => " + sessionId);
    let session = this._mediaSessions[sessionId];

    try {
      await session.stop();
      this._mediaSessions[sessionId] = null;
      return Promise.resolve();
    }
    catch (err) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  async connect (sourceId, sinkId) {
    let session = this._mediaSessions[sourceId];
    if(session) {
      try {
        console.log(" [SfuUser] Connecting sessions " + sourceId + "=>" + sinkId);
        await session.connect(sinkId);
        return Promise.resolve();
      }
      catch (err) {
        this.handleError(err);
        return Promise.reject(new Error(err));
      }
    }
    else {
      return Promise.reject(new Error("  [SfuUser] Source session " + sourceId + " not found"));
    }
  }

  async leave () {
    let sessions = Object.keys(this._mediaSessions);
    console.log("  [SfuUser] User sessions will be killed");
    console.log(sessions);

    try {
      for (var session in sessions) {
        await this.stopSession(sessions[session]);
      }

      return Promise.resolve(sessions);
    }
    catch (err) {
      this.handleError(err);
      Promise.reject(new Error(err));
    }
  }

  handleError (err) {
    console.log(err);
    this._status = C.STATUS.STOPPED;
  }
}
