'use strict'

const config = require('config');
const C = require('../constants/Constants');
const Logger = require('../../../utils/Logger');
// Model
const SfuUser = require('../model/SfuUser');
const Room = require('../model/Room.js');
const { handleError } = require('../utils/util');
const LOG_PREFIX = "[mcs-controller]";

/* PUBLIC ELEMENTS */

let instance = null;

module.exports = class MediaController {
  constructor(emitter) {
    if (!instance) {
      this.emitter = emitter;
      this._rooms = {};
      this._users = {};
      this._mediaSessions = {};
      instance = this;
    }

    return instance;
  }

  start (_kurentoClient, _kurentoToken, callback) {
    // TODO
    return callback(null);
  }

  stop (callback) {
    // TODO
  }

  getRoom (roomId) {
    return this._rooms[roomId];
  }

  async join (roomId, type, params) {
    Logger.info("[mcs-controller] Join room => " + roomId + ' as ' + type);
    try {
      let session;
      const room = await this.createRoomMCS(roomId);
      const user = await this.createUserMCS(roomId, type, params);
      room.setUser(user.id);

      if (params.sdp) {
        session = user.addSdp(params.sdp);
      }
      if (params.uri) {
        session = user.addUri(params.sdp);
      }

      Logger.info("[mcs-controller] Resolving user " + user.id);
      return Promise.resolve(user.id);
    }
    catch (err) {
      return Promise.reject(this._handleError(err));
    }
  }

  async leave (roomId, userId) {
    try {
      Logger.info("[mcs-controller] User => " + userId + " wants to leave ");
      const room = this.getRoom(roomId);
      const user = this.getUserMCS(userId);

      if (!user || !room) {
        return Promise.resolve();
      }

      const killedMedias = await user.leave();

      killedMedias.forEach((mediaId) => {
        delete this._mediaSessions[killedMedias[mediaId]];
      });

      room.destroyUser(user.id);
      delete this._users[user.id];

      return Promise.resolve();
    }
    catch (err) {
      return Promise.reject(this._handleError(err));
    }
  }

  publishnsubscribe (userId, sourceId, sdp, params = {}) {
    return new Promise(async (resolve, reject) => {
      Logger.info("[mcs-controller] PublishAndSubscribe from user", userId, "to source", sourceId);
      Logger.trace("[mcs-controler] PublishAndSubscribe descriptor is", params.descriptor);

      try {
        const type = params.type;
        const user = this.getUserMCS(userId);
        const userId = user.id;
        const session = user.addSdp(sdp, type);
        const sessionId = session.id;

        this._mediaSessions[session.id] = session;

        const answer = await user.startSession(session.id);
        await user.connect(sourceId, session.id);

        Logger.info("[mcs-controller] PublishAndSubscribe return a SDP session with ID", session.id);
        resolve({userId, sessionId});
      }
      catch (err) {
        reject(this._handleError(err));
      }
      finally {
        if (typeof err === 'undefined' && session) {
          session.sessionStarted();
        }
      }
    });
  }

  publish (userId, roomId, type, params = {}) {
    return new Promise(async (resolve, reject) => {
      Logger.info("[mcs-controller] Publish from user", userId, "to room", roomId);
      Logger.trace("[mcs-controler] Publish descriptor is", params.descriptor);

      try {
        const user = await this.getUserMCS(userId);

        Logger.info("[mcs-controller] Fetched user", user.id);

        switch (type) {
          case C.MEDIA_TYPE.RTP:
          case C.MEDIA_TYPE.WEBRTC:
          case C.MEDIA_TYPE.URI:
            const { session, answer } = await user.publish(params.descriptor, type, params);
            this.addMediaSession(session);
            resolve({ answer, sessionId: session.id });
            session.sessionStarted();
            break;

          default:
            return reject(this._handleError(C.ERROR.MEDIA_INVALID_TYPE));
        }
      }
      catch (err) {
        reject(this._handleError(err));
      }
    });
  }

  addMediaSession (session) {
    if (typeof this._mediaSessions[session.id] == 'undefined' ||
        !this._mediaSessions[session.id]) {
      this._mediaSessions[session.id] = {};
    }

    this._mediaSessions[session.id] = session;
  }

  subscribe (userId, sourceId, type, params = {}) {
    return new Promise(async (resolve, reject) => {
      Logger.info("[mcs-controller] Subscribe from user", userId, "to source", sourceId);
      Logger.trace("[mcs-controler] Subscribe descriptor is", params.descriptor);

      try {
        const user = await this.getUserMCS(userId);
        const source = this.getMediaSession(sourceId);

        Logger.info("[mcs-controller] Fetched user", user.id);

        switch (type) {
          case C.MEDIA_TYPE.RTP:
          case C.MEDIA_TYPE.WEBRTC:
          case C.MEDIA_TYPE.URI:
            const  { session, answer } = await user.subscribe(params.descriptor, type, source, params);
            this.addMediaSession(session);
            source.subscribedSessions.push(session.id);
            resolve({answer, sessionId: session.id});
            session.sessionStarted();
            Logger.info("[mcs-controller] Updated", source.id,  "subscribers list to", source.subscribedSessions);
            break;
          default:
            return reject(this._handleError(C.ERROR.MEDIA_INVALID_TYPE));
        }
      }
      catch (err) {
        reject(this._handleError(err));
      }
    });
  }

  async unpublish (userId, mediaId) {
    try {
      const user = this.getUserMCS(userId);
      const answer = await user.unpublish(mediaId);
      this._mediaSessions[mediaId] = null;
      return Promise.resolve(answer);
    }
    catch (err) {
      err = this._handleError(err);
      return Promise.reject(this._handleError(err));
    }
  }

  async unsubscribe (userId, mediaId) {
    try {
      const user = this.getUserMCS(userId);
      const answer = await user.unsubscribe(mediaId);
      this._mediaSessions[mediaId] = null;
      return Promise.resolve();
    }
    catch (err) {
      return Promise.reject(this._handleError(err));
    }
  }

  async startRecording (userId, sourceId, recordingName) {
    Logger.info("[mcs-controller] startRecording ", sourceId);
    try {
      const user = await this.getUserMCS(userId);
      const sourceSession = this.getMediaSession(sourceId);

      const session = await user.addRecording(recordingName);
      const answer = await user.startSession(session.id);
      await sourceSession.connect(session._mediaElement);

      sourceSession.subscribedSessions.push(session.id);
      this._mediaSessions[session.id] = session;

      return Promise.resolve(answer);
    }
    catch (err) {
      return Promise.reject(this._handleError(err));
    }
    finally {
      if (typeof err === 'undefined' && session) {
        session.sessionStarted();
      }
    }
  }

  async stopRecording (userId, sourceId, recId) {
    return new Promise(async (resolve, reject) => {
      Logger.info("[mcs-controller] Stopping recording session", recId);
      try {
        const user = await this.getUserMCS(userId);
        const recSession = this.getMediaSession(recId);
        const sourceSession = this.getMediaSession(sourceId);

        const answer = await user.stopSession(recSession.id);
        user.unsubscribe(recSession.id);
        this._mediaSessions[recId] = null;
        return resolve(answer);
      }
      catch (err) {
        return reject(this._handleError(err));
      }
    });
  }

  connect (sourceId, sinkId, type) {
    return new Promise(async (resolve, reject) => {
      Logger.info("[mcs-controller] Connect", sourceId, "to", sinkId, "with type", type);

      try {
        const sourceSession = this.getMediaSession(sourceId);
        const sinkSession = this.getMediaSession(sinkId);

        await sourceSession.connect(sinkSession._mediaElement, type);
        return resolve();
      }
      catch (err) {
        return reject(this._handleError(err));
      }
    });
  }

  disconnect (sourceId, sinkId, type) {
    return new Promise(async (resolve, reject) => {
      try {
        Logger.info("[mcs-controller] Disconnect", sourceId, "to", sinkId, "with type", type);
        const sourceSession = this.getMediaSession(sourceId);
        const sinkSession = this.getMediaSession(sinkId);

        await sourceSession.disconnect(sinkSession._mediaElement, type);
        return resolve();
      }
      catch (err) {
        return reject(this._handleError(err));
      }
    });
  }

  addIceCandidate (mediaId, candidate) {
    return new Promise(async (resolve, reject) => {
      try {
        const session = this.getMediaSession(mediaId);
        await session.addIceCandidate(candidate);

        return resolve();
      }
      catch (err) {
        return reject(this._handleError(err));
      }
    });
  }

  /**
   * Creates an empty {Room} room and indexes it
   * @param {String} roomId
   */
  async createRoomMCS (roomId)  {
    Logger.info("[mcs-controller] Creating new room with ID", roomId);

    if (this._rooms[roomId] == null) {
      this._rooms[roomId] = new Room(roomId);
    }

    return Promise.resolve(this._rooms[roomId]);
  }

  /**
   * Creates an {User} of type @type
   * @param {String} roomId
   */
  createUserMCS (roomId, type, params)  {
    let user;
    Logger.info("[mcs-controller] Creating a new", type, "user at room", roomId);

    switch (type) {
      case C.USERS.SFU:
        user  = new SfuUser(roomId, type, this.emitter, params.userAgentString, params.descriptor);
        break;
      case C.USERS.MCU:
        Logger.warn("[mcs-controller] createUserMCS MCU TODO");
        break;
      default:
        Logger.warn("[mcs-controller] Unrecognized user type");
    }

    if(this._users[user.id] == null) {
      this._users[user.id] = user;
    }

    return Promise.resolve(user);
  }

  getUserMCS (userId) {
    const user = this._users[userId];

    if (user == null) {
      throw C.ERROR.USER_NOT_FOUND;
    }

    return user;
  }

  getMediaSession (mediaId) {
    const media = this._mediaSessions[mediaId];

    if (media == null) {
        throw C.ERROR.MEDIA_NOT_FOUND;
    }

    return media;
  }

  _handleError (error) {
    return handleError(LOG_PREFIX, error);
  }
}
