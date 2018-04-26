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
      return Promise.resolve(answer);
    }
    catch (err) {
      Logger.error("[MCSApi] join ", err);
      Promise.reject(err);
    }
  }

  async leave (roomId, userId) {
    try {
      const answer = await this._mediaController.leave(roomId, userId);
      return Promise.resolve(answer);
    }
    catch (err) {
      Logger.error("[MCSApi] leave ", err);
      return Promise.reject(err);
    }
  }

  async publishnsubscribe (user, sourceId, sdp, params) {
    try {
      const answer = await this._mediaController.publishnsubscribe(user, sourceId, sdp, params);
      return Promise.resolve(answer);
    }
    catch (err) {
      Logger.error("[MCSApi] publishnsubscribe ", err);
      return Promise.reject(err);
    }
  }

  async publish (user, room,  type, params) {
    try {
      const answer = await this._mediaController.publish(user, room, type, params);
      return Promise.resolve(answer);
    }
    catch (err) {
      Logger.error("[MCSApi] publish ", err);
      return Promise.reject(err);
    }
  }

  async unpublish (user, mediaId) {
    try {
      await this._mediaController.unpublish(mediaId);
      return Promise.resolve();
    }
    catch (err) {
      Logger.error("[MCSApi] unpublish ", err);
      return Promise.reject(err);
    }
  }

  async subscribe (user, sourceId, type, params) {
    try {
      const answer = await this._mediaController.subscribe(user, sourceId, type, params);

      return Promise.resolve(answer);
    }
    catch (err) {
      Logger.error("[MCSApi] subscribe ", err);
      return Promise.reject(err);
    }
  }

  async unsubscribe (user, mediaId) {
    try {
      await this._mediaController.unsubscribe(user, mediaId);
      return Promise.resolve();
    }
    catch (err) {
      Logger.error("[MCSApi] unsubscribe ", err);
      return Promise.reject(err);
    }
  }

  async startRecording(userId, mediaId, recordingName) {
    try {
      const answer = await this._mediaController.startRecording(userId, mediaId, recordingName);
      return Promise.resolve(answer);
    }
    catch (err) {
      Logger.error("[MCSApi] startRecording ", err);
      return Promise.reject(err);
    }
  }

  async stopRecording(mediaId) {
    try {
      let answer = await this._mediaController.stopRecording(mediaId);
      return Promise.resolve(answer);
    }
    catch (err) {
      Logger.error("[MCSApi] stopRecording ", err);
      return Promise.reject(err);
    }
  }

  async onEvent (eventName, mediaId) {
    try {
      const eventTag = this._mediaController.onEvent(eventName, mediaId);
      this._mediaController.on(eventTag, (event) => {
        this.emitter.emit(eventTag, event);
      });

      return Promise.resolve(eventTag);
    }
    catch (err) {
      Logger.error("[MCSApi] onEvent ", err);
      return Promise.reject();
    }
  }

  async addIceCandidate (mediaId, candidate) {
    try {
      const ack = await this._mediaController.addIceCandidate(mediaId, candidate);
      return Promise.resolve(ack);
    }
    catch (err) {
      Logger.error("[MCSApi] addIceCandidate ", err);
      Promise.reject();
    }
  }

  setStrategy (strategy) {
    // TODO
  }
}
