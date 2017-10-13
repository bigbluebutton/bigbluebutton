/*
 * Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

'use strict';

// const express = require('express');
// const session = require('express-session')
// const wsModule = require('./websocket');

const http = require('http');
const fs = require('fs');
const EventEmitter = require('events');
const BigBlueButtonGW = require('../bbb/pubsub/bbb-gw');
const C = require('../bbb/messages/Constants');

// Global variables
module.exports = class ConnectionManager {

  constructor (settings, logger) {
    this._logger = logger;
    this._screenshareSessions = {};

    this._emitter = this._setupEventEmitter();
    this._adapters = [];

    this._setupBBB();
  }

  setHttpServer(httpServer) {
    this.httpServer = httpServer;
  }

  listen(callback) {
    this.httpServer.listen(callback);
  }

  addAdapter(adapter) {
    adapter.setEventEmitter(this._emitter);
    this._adapters.push(adapter);
  }

  _setupEventEmitter() {
    let self = this;
    let emitter = new EventEmitter();

    emitter.on(C.WEBSOCKET_MESSAGE, (data) => {
      console.log("  [ConnectionManager] RECEIVED DATA FROM WEBSOCKET");
      self._bbbGW.publish(JSON.stringify(data), C.TO_SCREENSHARE);
    });

    emitter.on(C.REDIS_MESSAGE, (data) => {
      console.log("  [ConnectionManager] RECEIVED DATA FROM REDIS");
      emitter.emit('response', data);
    });

    return emitter;
  }

  _setupBBB() {
    this._bbbGW = new BigBlueButtonGW(this._emitter);

    try {
      const transcode = this._bbbGW.addSubscribeChannel(C.FROM_BBB_TRANSCODE_SYSTEM_CHAN);
      const screenshare = this._bbbGW.addSubscribeChannel(C.FROM_SCREENSHARE);
      const video = this._bbbGW.addSubscribeChannel(C.FROM_VIDEO);
      const audio = this._bbbGW.addSubscribeChannel(C.FROM_AUDIO);

      console.log('  [ConnectionManager] Successfully subscribed to processes redis channels');
    }
    catch (err) {
      console.log('  [ConnectionManager] ' + err);
      this._stopAll;
    }
  }

  _stopSession(sessionId) {
  }

  _stopAll() {
  }
}

module.exports.events = ['startWebRtc', ''];
