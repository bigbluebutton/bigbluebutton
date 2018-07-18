'use strict'

const config = require('config');
const C = require('../constants/Constants');
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const MediaController = require('./MediaController.js');
const Logger = require('../../../utils/Logger');

let instance = null;

module.exports = class MCSApiStub extends EventEmitter {
  constructor() {
    if(!instance) {
      super();
      this.emitter = this;
      this._mediaController = new MediaController(this.emitter);
      instance = this;
    }

    return instance;
  }

  async join (room, type, params) {
    try {
      const answer = await this._mediaController.join(room, type, params);
      return (answer);
    }
    catch (error) {
      throw (this._handleError(error, 'join', { room, type, params}));
    }
  }

  async leave (room, user) {
    try {
      const answer = await this._mediaController.leave(room, user);
      return (answer);
    }
    catch (error) {
      throw (this._handleError(error, 'leave', { room, user }));
    }
  }

  async publishnsubscribe (user, sourceId, sdp, params) {
    try {
      const answer = await this._mediaController.publishnsubscribe(user, sourceId, sdp, params);
      return (answer);
    }
    catch (error) {
      throw (this._handleError(error, 'publishnsubscribe', { user, sourceId, sdp, params }));
    }
  }

  async publish (user, room,  type, params) {
    try {
      const answer = await this._mediaController.publish(user, room, type, params);
      return (answer);
    }
    catch (error) {
      throw (this._handleError(error, 'publish', { user, room, type, params }));
    }
  }

  async unpublish (user, mediaId) {
    try {
      await this._mediaController.unpublish(mediaId);
      return ;
    }
    catch (error) {
      throw (this._handleError(error, 'unpublish', { user, mediaId }));
    }
  }

  async subscribe (user, sourceId, type, params) {
    try {
      const answer = await this._mediaController.subscribe(user, sourceId, type, params);

      return (answer);
    }
    catch (error) {
      throw (this._handleError(error, 'subscribe', { user, sourceId, type, params }));
    }
  }

  async unsubscribe (user, mediaId) {
    try {
      await this._mediaController.unsubscribe(user, mediaId);
      return ;
    }
    catch (error) {
      throw (this._handleError(error, 'unsubscribe', { user, mediaId }));
    }
  }

  async startRecording(userId, mediaId, recordingName) {
    try {
      const answer = await this._mediaController.startRecording(userId, mediaId, recordingName);
      return (answer);
    }
    catch (error) {
      throw (this._handleError(error, 'startRecording', { userId, mediaId, recordingName }));
    }
  }

  async stopRecording(userId, sourceId, recId) {
    try {
      let answer = await this._mediaController.stopRecording(userId, sourceId, recId);
      return (answer);
    }
    catch (error) {
      throw (this._handleError(error, 'stopRecording', { userId, sourceId, recId }));
    }
  }

  async connect (source, sink, type) {
    try {
      await this._mediaController.connect(source, sink, type);
      return ;
    }
    catch (error) {
      throw (this._handleError(error, 'connect', { source, sink, type }));
    }
  }

  async disconnect (source, sink, type) {
    try {
      await this._mediaController.disconnect(source, sink, type);
      return ;
    }
    catch (error) {
      throw (this._handleError(error, 'disconnect', { source, sink, type }));
    }
  }

  async onEvent (eventName, mediaId) {
    try {
      const eventTag = this._mediaController.onEvent(eventName, mediaId);
      this._mediaController.on(eventTag, (event) => {
        this.emitter.emit(eventTag, event);
      });

      return (eventTag);
    }
    catch (error) {
      throw (this._handleError(error, 'onEvent', { eventName, mediaId }));
    }
  }

  async addIceCandidate (mediaId, candidate) {
    try {
      await this._mediaController.addIceCandidate(mediaId, candidate);
      return ;
    }
    catch (error) {
      throw (this._handleError(error, 'addIceCandidate', { mediaId, candidate }));
    }
  }

  setStrategy (strategy) {
    // TODO
  }

  _handleError (error, operation, params) {
    const { code, message, details } = error;
    const response = { type: 'error', code, message, details, operation, params};
    Logger.error("[mcs-api] Reject operation", response.operation, "with", { error: response });

    return response;
  }
}
