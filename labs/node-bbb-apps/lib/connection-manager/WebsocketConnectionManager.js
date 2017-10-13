'use strict';

const ws = require('ws');
const C = require('../bbb/messages/Constants');

ws.prototype.setErrorCallback = function(callback) {

  this._errorCallback = callback;
};

ws.prototype.sendMessage = function(json) {

  let websocket = this;

  if (this._closeCode === 1000) {
    console.log("Websocket closed, not sending");
    this._errorCallback("Error: not opened");
  }

  return this.send(JSON.stringify(json), function(error) {
    if(error) {
      console.log('server: Websocket error "' + error + '" on message "' + json.id + '"');

      websocket._errorCallback(error);
    }
  });

};

module.exports = class WebsocketConnectionManager {

  constructor(server, path) {
    this.wss = new ws.Server({
      server,
      path
    });

    this.wss.on('connection', (ws) => {
      ws.on('message', this._onMessage.bind(this));
      ws.setErrorCallback(this._onError.bind(this));

      ws.on('close', this._onClose.bind(this));
      ws.on('error', this._onError.bind(this));

      console.log(this.emitter);
      // TODO: should we delete this listener after websocket dies?
      this.emitter.on('response', this._onServerResponse.bind(ws));
    });

  }

  setEventEmitter(emitter) {
    console.log(emitter);
    this.emitter = emitter;
  }

  _onServerResponse(data) {

    console.log(' [WS] Receiving event ');
    console.log(data);

    // Here this is the 'ws' instance
    this.sendMessage(data);
  }

  _onMessage(data) {

    let message = {};

    try {
      message = JSON.parse(data);
    } catch(e) {
      console.error(" [WS] JSON message parse error " + e);
      message = {};
    }

    // Test for empty or invalid JSON
    if (Object.getOwnPropertyNames(message).length !== 0) {
      this.emitter.emit(C.WEBSOCKET_MESSAGE, message);
    }
  }

  _onError(err) {
    console.log('Connection error');

  }

  _onClose(err) {
    console.log('closed Connection');
  }

}
