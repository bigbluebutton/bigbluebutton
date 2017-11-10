'use strict'

var config = require('config');
var C = require('../constants/Constants');
// EventEmitter
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MediaController = require('./MediaController.js');

let instance = null;

module.exports = class MCSApiStub extends EventEmitter{
  constructor() {
    if(!instance) {
      super();
      this.listener = new EventEmitter();
      this._mediaController = new MediaController(this.listener);
      instance = this;
    }

    return instance;
  }

  async join (room, type, params) {
    let self = this;
    try {
      const answer = await this._mediaController.join(room, type, params);
      return Promise.resolve(answer);
    }
    catch (err) {
      console.log(err);
      Promise.reject(err);
    }
  }

  // Not yet implemented in MediaController, should be simple nonetheless
  async leave (room, userId) {
    try {
      const answer = await this._mediaController.leave(room, userId);
      return Promise.resolve(answer);
    }
    catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  }

  async publishnsubscribe (user, sourceId, sdp, params) {
    try {
      const answer = await this._mediaController.publishnsubscribe(user, sourceId, sdp, params);
      return Promise.resolve(answer);
    }
    catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  }

  async publish (user, room,  type, params) {
    try {
      this.listener.once(C.EVENT.NEW_SESSION+user, (event) => {
        let sessionId = event;
        this.listener.on(C.EVENT.MEDIA_STATE.MEDIA_EVENT+sessionId, (event) => {
          this.emit(C.EVENT.MEDIA_STATE.MEDIA_EVENT+sessionId, event);
        });
      });
      const answer = await this._mediaController.publish(user, room, type, params);
      return Promise.resolve(answer);
    }
    catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  }
  
  async unpublish (user, mediaId) {
    try {
      const answer = await this._mediaController.unpublish(user, mediaId);
      return Promise.resolve(answer);
    }
    catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  }

  async subscribe (user, sourceId, type, params) {
    try {
      const answer = await this._mediaController.subscribe(user, sourceId, type, params);
      this.listener.on(C.EVENT.MEDIA_STATE.MEDIA_EVENT+answer.sessionId, (event) => {
        this.emit(C.EVENT.MEDIA_STATE.MEDIA_EVENT+answer.sessionId, event);
      });

      return Promise.resolve(answer);
    }
    catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  }

  async unsubscribe (user, sdp, params) {
    try {
      await this._mediaController.unsubscribe(user, mediaId);
      return Promise.resolve(answer);
    }
    catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  }

  async onEvent (eventName, mediaId) {
    try {
      const eventTag = this._mediaController.onEvent(eventName, mediaId);
      this._mediaController.on(eventTag, (event) => {
        this.emit(eventTag, event);
      });

      return Promise.resolve(eventTag);
    }
    catch (err) {
      console.log(err);
      return Promise.reject();
    }
  }

  async addIceCandidate (mediaId, candidate) {
    try {
      console.log("  [api] Adding ice candidate for => " + mediaId);
      const ack = await this._mediaController.addIceCandidate(mediaId, candidate);
      return Promise.resolve(ack);
    }
    catch (err) {
      console.log(err);
      Promise.reject();
    }
  }
  setStrategy (strategy) {
    // TODO
  }
}
