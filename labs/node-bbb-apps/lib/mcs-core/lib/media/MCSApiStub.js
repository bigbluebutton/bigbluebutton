'use strict'

var config = require('config');
var C = require('../constants/Constants');
// EventEmitter
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MediaController = require('./MediaController.js');


module.exports = class MCSApiStub extends EventEmitter {
  constructor() {
    super();
    this._mediaController = new MediaController();
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
      Promise.reject(err);
    }
  }

  setStrategy (strategy) {
    // TODO
  }
}
