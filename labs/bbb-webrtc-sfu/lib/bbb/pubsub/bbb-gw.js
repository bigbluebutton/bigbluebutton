/**
 * @classdesc
 * BigBlueButton redis gateway for bbb-screenshare node app
 */

'use strict';

/* Modules */

const C = require('../messages/Constants.js');
const RedisWrapper = require('./RedisWrapper.js');
const config = require('config');
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const Logger = require('../../utils/Logger');

let instance = null;

module.exports = class BigBlueButtonGW extends EventEmitter {
  constructor() {
    if(!instance){
      super();
      this.subscribers = {};
      this.publisher = null;
      instance = this;
    }

    return instance;
  }

  addSubscribeChannel (channel) {
    if (this.subscribers[channel]) {
      return this.subscribers[channel];
    }

    let wrobj = new RedisWrapper(channel);
    this.subscribers[channel] = {};
    this.subscribers[channel] = wrobj;
    try {
      wrobj.startSubscriber();
      wrobj.on(C.REDIS_MESSAGE, this.incomingMessage.bind(this));
      Logger.info("[BigBlueButtonGW] Added redis client to this.subscribers[" + channel + "]");
      return Promise.resolve(wrobj);
    }
    catch (error) {
      return Promise.reject("[BigBlueButtonGW] Could not start redis client for channel " + channel);
    }
  }

  /**
   * Capture messages from subscribed channels and emit an event with it's
   * identifier and payload. Check Constants.js for the identifiers.
   *
   * @param {Object} message  Redis message
   */
  incomingMessage (message) {
    let header;
    let payload;
    let msg = (typeof message !== 'object')?JSON.parse(message):message;

    // Trying to parse both message types, 1x and 2x
    if (msg.header) {
      header = msg.header;
      payload = msg.payload;
    }
    else if (msg.core) {
      header = msg.core.header;
      payload = msg.core.body;
    }

    if (header){
      switch (header.name) {
        // interoperability with 1.1
        case C.START_TRANSCODER_REPLY:
          this.emit(C.START_TRANSCODER_REPLY, payload);
          break;
        case C.STOP_TRANSCODER_REPLY:
          this.emit(C.STOP_TRANSCODER_REPLY, payload);
          break;
          // 2x messages
        case C.START_TRANSCODER_RESP_2x:
          payload[C.MEETING_ID_2x] = header[C.MEETING_ID_2x];
          this.emit(C.START_TRANSCODER_RESP_2x, payload);
          break;
        case C.STOP_TRANSCODER_RESP_2x:
          payload[C.MEETING_ID_2x] = header[C.MEETING_ID_2x];
          this.emit(C.STOP_TRANSCODER_RESP_2x, payload);
          break;

        default:
          this.emit(C.GATEWAY_MESSAGE, msg);
      }
    }
    else {
      this.emit(C.GATEWAY_MESSAGE, msg);
    }
  }

  publish (message, channel) {
    if (!this.publisher) {
      this.publisher = new RedisWrapper();
      this.publisher.startPublisher();
    }

    if (typeof this.publisher.publishToChannel === 'function') {
      this.publisher.publishToChannel(message, channel);
    }
  }

  writeMeetingKey(prefix, meetingId, message, callback) {
    if (!this.client) {
      this.publisher = new RedisWrapper();
      this.publisher.startPublisher();
    }

    this.publisher.setKeyWithIncrement(prefix + ':' + meetingId, message, callback);
  }

  setEventEmitter (emitter) {
    this.emitter = emitter;
  }

  _onServerResponse(data) {
    // Here this is the 'ws' instance
    this.sendMessage(data);
  }
}
