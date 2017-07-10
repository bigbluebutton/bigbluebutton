/**
 * @classdesc
 * Redis wrapper class for connecting to Redis channels
 */

/* Modules */

var redis = require('redis');
var config = require('config');
var Constants = require('../messages/Constants.js');
var util = require('util');
const EventEmitter = require('events').EventEmitter;
const _retryThreshold = 1000 * 60 * 60;
const _maxRetries = 10;


/* Public members */

var RedisWrapper = function(subpattern) {
  // Redis PubSub client holders
  this.redisCli = null;
  this.redisPub = null;
  // Pub and Sub channels/patterns
  this.subpattern = subpattern;
  EventEmitter.call(this);
}

util.inherits(RedisWrapper, EventEmitter);

RedisWrapper.prototype.startRedis = function(callback) {
  var self = this;
  if (this.redisCli) {
    console.log("  [RedisWrapper] Redis Client already exists");
    callback(false, this);
  }

  var options = {
    host : config.get('redisHost'),
    port : config.get('redisPort'),
    //password: config.get('redis.password')
    retry_strategy: redisRetry
  };

  this.redisCli = redis.createClient(options);
  this.redisPub = redis.createClient(options);

  console.log("  [RedisWrapper] Trying to subscribe to redis channel");

  this.redisCli.on("psubscribe", function (channel, count) {
    console.log(" [RedisWrapper] Successfully subscribed to pattern [" + channel + "]");
  });

  this.redisCli.on("pmessage", self.onMessage.bind(self));
  this.redisCli.psubscribe(this.subpattern);

  console.log("  [RedisWrapper] Started Redis client at " + options.host + ":" + options.port +
    " for subscription pattern: " + this.subpattern);

  callback(false, this);
};

RedisWrapper.prototype.stopRedis = function(callback) {
  if (this.redisCli){
    this.redisCli.quit();
  }
  callback(false);
};

RedisWrapper.prototype.publishToChannel = function(message, channel) {
  if(this.redisPub) {
    console.log("  [RedisWrapper] Sending message to channel [" + channel + "]: " + message);
    this.redisPub.publish(channel, message);
  }
};

RedisWrapper.prototype.onMessage = function(pattern, channel, message) {
  console.log(" [RedisWrapper] Message received from channel [" + channel +  "] : " + message);
  // use event emitter to throw new message
  this.emit(Constants.REDIS_MESSAGE, message);
}

/* Private members */

function redisRetry(options) {
  if (options.error && options.error.code === 'ECONNREFUSED') {
    return new Error('The server refused the connection');
  }
  if (options.total_retry_time > _retryThreshold) {
    return new Error('Retry time exhausted');
  }
  if (options.times_connected > _maxRetries) {
    return undefined;
  }
  return Math.max(options.attempt * 100, 3000);
};

module.exports = RedisWrapper;
