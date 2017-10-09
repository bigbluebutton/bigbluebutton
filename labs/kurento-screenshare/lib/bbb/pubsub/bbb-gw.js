/**
 * @classdesc
 * BigBlueButton redis gateway for bbb-screenshare node app
 */

/* Modules */

var C = require('../messages/Constants.js');
var RedisWrapper = require('./RedisWrapper.js');
var config = require('config');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/* Public members */

var BigBlueButtonGW = function () {
  this.redisClients = null 
  EventEmitter.call(this);
};

util.inherits(BigBlueButtonGW, EventEmitter);

BigBlueButtonGW.prototype.addSubscribeChannel = function (channel, callback) {
  var self = this;

  if (this.redisClients === null) {
    this.redisClients = {};
  }

  if (this.redisClients[channel]) {
    return callback(null, this.redisClients[channel]);
  }

  var wrobj = new RedisWrapper(channel);
  this.redisClients[channel] = {};
  this.redisClients[channel] = wrobj;
  wrobj.startRedis(function(error, redisCli) {
    if(error) {
      console.log("  [BigBlueButtonGW] Could not start redis client for channel " + channel);
      return callback(error);
    }

    console.log("  [BigBlueButtonGW] Added redis client to this.redisClients[" + channel + "]");
    wrobj.on(C.REDIS_MESSAGE, self.incomingMessage.bind(self));

    return callback(null, wrobj);
  });
};

/**
 * Capture messages from subscribed channels and emit an event with it's
 * identifier and payload. Check Constants.js for the identifiers.
 *
 * @param {Object} message  Redis message
 */
BigBlueButtonGW.prototype.incomingMessage = function (message) {
  var msg = JSON.parse(message);

  // Trying to parse both message types, 1x and 2x
  if (msg.header) {
    var header = msg.header;
    var payload = msg.payload;
  }
  else if (msg.core) {
    var header = msg.core.header;
    var payload = msg.core.body;
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
        console.log("  [BigBlueButtonGW] Unknown Redis message with ID =>" + header.name);
    }
  }
};

BigBlueButtonGW.prototype.publish = function (message, channel, callback) {
  for(var client in this.redisClients) {
    if(typeof this.redisClients[client].publishToChannel === 'function') {
      this.redisClients[client].publishToChannel(message, channel);
      return callback(null);
    }
  }
  return callback("Client not found");
};

module.exports = BigBlueButtonGW;
