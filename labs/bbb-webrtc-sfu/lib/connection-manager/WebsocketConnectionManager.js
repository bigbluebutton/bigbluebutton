'use strict';

const ws = require('ws');
const C = require('../bbb/messages/Constants');

// initialization
let connectionIDCounter = 0;

// when handling a new connection


ws.prototype.setErrorCallback = function(callback) {

  this._errorCallback = callback;
};

ws.prototype.sendMessage = function(json) {

  let websocket = this;

  if (this._closeCode === 1000) {
    console.log("  [WebsocketConnectionManager] Websocket closed, not sending");
    this._errorCallback("Error: not opened");
  }

  return this.send(JSON.stringify(json), function(error) {
    if(error) {
      console.log('  [WebsocketConnectionManager] server: Websocket error "' + error + '" on message "' + json.id + '"');

      websocket._errorCallback(error);
    }
  });

};

module.exports = class WebsocketConnectionManager {
  constructor (server, path) {
    this.wss = new ws.Server({
      server,
      path
    });

    this.wss.on ('connection', (ws) => {
      let self = this;

      ws.id = connectionIDCounter++;

      console.log(" [WebsocketConnectionManager] New connection with id [ " + ws.id + " ]");

      ws.on('message', (data) => {
        let message = {};

        try {
          message = JSON.parse(data);
          message.connectionId = ws.id;

          if (!ws.sessionId) {
            ws.sessionId = message.voiceBridge;
          }

          if (!ws.route) {
            ws.route = message.type;
          }

          if (!ws.role) {
            ws.role = message.role;
          }
        } catch(e) {
          console.error("  [WebsocketConnectionManager] JSON message parse error " + e);
          message = {};
        }

        // Test for empty or invalid JSON
        if (Object.getOwnPropertyNames(message).length !== 0) {
          this.emitter.emit(C.WEBSOCKET_MESSAGE, message);
        }
      });

      //ws.on('message', this._onMessage.bind(this));
      ws.setErrorCallback(this._onError.bind(this));

      ws.on('close', (ev) => {
        console.log('  [WebsocketConnectionManager] Closed connection on [' + ws.id + ']');
        let message = {
          id: 'close',
          type: ws.route,
          role: ws.role,
          voiceBridge: ws.sessionId,
          connectionId: ws.id
        }

        this.emitter.emit(C.WEBSOCKET_MESSAGE, message);
      });

      ws.on('error', (err) => {
        console.log('  [WebsocketConnectionManager] Connection error [' + ws.id + ']');
        let message = {
          id: 'error',
          type: ws.route,
          role: ws.role,
          voiceBridge: ws.sessionId,
          connectionId: ws.id
        }
        this.emitter.emit(C.WEBSOCKET_MESSAGE, message);
      });

      // TODO: should we delete this listener after websocket dies?
      this.emitter.on('response', (data) => {
        if (ws.id == data.connectionId) {
          ws.sendMessage(data);
        }
      });
    });
  }

  setEventEmitter (emitter) {
    this.emitter = emitter;
  }

  _onServerResponse (data) {
    // Here this is the 'ws' instance
    this.sendMessage(data);
  }

  _onMessage (data) {

    let message = {};

    try {
      message = JSON.parse(data);
    } catch(e) {
      console.error("  [WebsocketConnectionManager] JSON message parse error " + e);
      message = {};
    }

    // Test for empty or invalid JSON
    if (Object.getOwnPropertyNames(message).length !== 0) {
      this.emitter.emit(C.WEBSOCKET_MESSAGE, message);
    }
  }

  _onError (err) {
    console.log('  [WebsocketConnectionManager] Connection error');
    let message = {
      id: 'error',
      voiceBridge: ws.sessionId,
      connectionId: ws.id
    }
    this.emitter.emit(C.WEBSOCKET_MESSAGE, message);
  }

  _onClose (err) {
    console.log('  [WebsocketConnectionManager] Closed connection [' + this.id + ']');
    let message = {
      id: 'close',
      voiceBridge: this.sessionId,
      connectionId: this.id
    }

    this.emitter.emit(C.WEBSOCKET_MESSAGE, message);
  }

  _stop () {
  }
}
