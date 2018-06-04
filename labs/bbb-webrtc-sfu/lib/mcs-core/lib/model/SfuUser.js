/**
 * @classdesc
 * Model class for external devices
 */

'use strict'

const User = require('./User');
const C = require('../constants/Constants');
const SdpWrapper = require('../utils/SdpWrapper');
const SdpSession = require('../model/SdpSession');
const RecordingSession = require('../model/RecordingSession');
const UriSession = require('../model/UriSession');
const Logger = require('../../../utils/Logger');
const isError = require('../utils/util').isError;

module.exports = class SfuUser extends User {
  constructor(_roomId, type, emitter, userAgentString = C.STRING.ANONYMOUS, sdp = null, uri = null) {
    super(_roomId);
    // {SdpWrapper} SdpWrapper
    this._sdp;
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

  // TODO switch from type to children UriSessions (RTSP|HTTP|etc)
  async addUri (uri, type) {
      const session = new UriSession(uri, type);
      this.emitter.emit(C.EVENT.NEW_SESSION+this.id, session.id);

      session.emitter.once(C.EVENT.MEDIA_SESSION_STOPPED, (sessId) => {
        if (sessId === session.id) {
          Logger.info("[mcs-sfu-user] URI session stopped.");
          this._mediaSessions[sessId] = null;
        }
      });

      if (typeof this._mediaSessions[session.id] == 'undefined' ||
          !this._mediaSessions[session.id]) {
        this._mediaSessions[session.id] = {};
      }

      this._mediaSessions[session.id] = session;

      Logger.info("[mcs-sfu-user] Added new URI session", session.id, "to user", this.id);

      return session;
  }

  addSdp (sdp, type, options) {
    // TODO switch from type to children SdpSessions (WebRTC|SDP)
    let session = new SdpSession(this.emitter, sdp, this.roomId, type, options);
    session.emitter.on(C.EVENT.MEDIA_SESSION_STOPPED, (sessId) => {
      if (sessId === session.id) {
        Logger.info("[mcs-sfu-user] Session ", sessId, "stopped, cleaning it...");
        this._mediaSessions[sessId] = null;
      }
    });

    if (typeof this._mediaSessions[session.id] == 'undefined' ||
        !this._mediaSessions[session.id]) {
      this._mediaSessions[session.id] = {};
    }
    this._mediaSessions[session.id] = session;

    Logger.info("[mcs-sfu-user] Added new SDP session", session.id, "to user", this.id);

    return session;
  }

  addRecording (recordingName) {
    const session = new RecordingSession(this.emitter, this.roomId, recordingName);
    this.emitter.emit(C.EVENT.NEW_SESSION+this.id, session.id);

    session.emitter.once(C.EVENT.MEDIA_SESSION_STOPPED, (sessId) => {
      if (sessId === session.id) {
        Logger.info("[mcs-sfu-user] Recording session stopped.");
        this._mediaSessions[sessId] = null;
      }
    });

    if (typeof this._mediaSessions[session.id] == 'undefined' ||
        !this._mediaSessions[session.id]) {
      this._mediaSessions[session.id] = {};
    }
    this._mediaSessions[session.id] = session;
    Logger.info("[mcs-sfu-user] Added new recording session", session.id, "to user", this.id);

    return session;
  }


  startSession (sessionId) {
    const session = this._mediaSessions[sessionId];
    return new Promise(async (resolve, reject) => {
      try {
        const mediaElement = await session.start();
        const answer = await session.process();
        resolve(answer);
      }
      catch (err) {
        return reject(this._handleError(err));
      }
    });
  }

  subscribe (sdp, type, source, params) {
    return new Promise(async (resolve, reject) => {
      try {
        const session = this.addSdp(sdp, type, params);
        const answer = await this.startSession(session.id);
        await source.connect(session._mediaElement);
        resolve({ session, answer });
      }
      catch (err) {
        return reject(this._handleError(err));
      }
    });
  }

  publish (sdp, type, params) {
    return new Promise(async (resolve, reject) => {
      try {
        const session = this.addSdp(sdp, type, params);
        const answer = await this.startSession(session.id);
        resolve({ session, answer });
      }
      catch (err) {
        return reject(this._handleError(err));
      }
    });
  }

  unsubscribe (mediaId) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.stopSession(mediaId);
        resolve(mediaId);
      }
      catch (err) {
        reject(this._handleError(err));
      }
    });
  }

  unpublish (mediaId) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.stopSession(mediaId);
        resolve(mediaId);
      }
      catch (err) {
        reject(this._handleError(err));
      }
    });
  }

  stopSession (sessionId) {
    const session = this._mediaSessions[sessionId];

    return new Promise(async (resolve, reject) => {
      try {
        if (session) {
          Logger.info("[mcs-sfu-user] Stopping session => " + sessionId);
          await session.stop();
          delete this._mediaSessions[sessionId];
        }

        return resolve();
      }
      catch (err) {
        reject(this._handleError(err));
      }
    });
  }

  connect (sourceId, sinkId) {
    const session = this._mediaSessions[sourceId];

    return new Promise(async (resolve, reject) => {
      try {
        if (session == null) {
          return reject(this._handleError("[mcs-sfu-user] Source session " + sourceId + " not found"));
        }
        Logger.info("[mcs-sfu-user] Connecting sessions " + sourceId + "=>" + sinkId);
        await session.connect(sinkId);
        return resolve();
      }
      catch (err) {
        return reject(this._handleError(err));
      }
    });
  }

  async leave () {
    const sessions = Object.keys(this._mediaSessions);
    let stopProcedures = [];
    Logger.info("[mcs-sfu-user] User sessions will be killed");

    try {
      for (let i = 0; i < sessions.length; i++) {
        stopProcedures.push(this.stopSession(sessions[i]));
      }

      return Promise.all(stopProcedures);
    }
    catch (err) {
      err = this._handleError(err);
      Promise.reject(err);
    }
  }

  _handleError (error) {
    Logger.trace("[mcs-sfu-user] SFU User received error", error, error.stack);
    // Checking if the error needs to be wrapped into a JS Error instance
    if (!isError(error)) {
      error = new Error(error);
    }
    this._status = C.STATUS.STOPPED;
    return error;
  }
}
