/**
 * @classdesc
 * BigBlueButton redis gateway for bbb-screenshare node app
 */

/* Modules */

var Constants = require('../messages/Constants.js');
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
    wrobj.on(Constants.REDIS_MESSAGE, function(message) {  var msg = JSON.parse(message);
      var header = msg.header;
      var payload = msg.payload;
      if (header){
        switch (header.name) {
          case Constants.START_TRANSCODER_REPLY:
            console.log("Received TRANSCODER REPLY => " + payload);
            self.emit(Constants.START_TRANSCODER_REPLY, payload);
            break;
          case Constants.STOP_TRANSCODER_REPLY:
            self.emit(Constants.STOP_TRANSCODER_REPLY, payload);
            break;
          default:
            console.log("  [BigBlueButtonGW] Unknown Redis message with ID =>" + header.name);
        }
      }
    });
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
  var header = msg.header;
  var payload = msg.payload;
  if (header){
    switch (header.name) {
      case Constants.START_TRANSCODER_REPLY:
        console.log("Received TRANSCODER REPLY => " + payload);
        this.emit(Constants.START_TRANSCODER_REPLY, payload);
        break;
      case Constants.STOP_TRANSCODER_REPLY:
        this.emit(Constants.STOP_TRANSCODER_REPLY, payload);
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
