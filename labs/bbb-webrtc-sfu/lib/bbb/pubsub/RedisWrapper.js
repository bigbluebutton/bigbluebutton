/**
 * @classdesc
 * Redis wrapper class for connecting to Redis channels
 */

'use strict';

/* Modules */

const redis = require('redis');
const config = require('config');
const Constants = require('../messages/Constants.js');
const EventEmitter = require('events').EventEmitter;
const Logger = require('../../utils/Logger');

/* Public members */

module.exports = class RedisWrapper extends EventEmitter {
  constructor(subpattern) {
    super();
    // Redis PubSub client holders
    this.redisCli = null;
    this.redisPub = null;
    // Pub and Sub channels/patterns
    this.subpattern = subpattern;
  }

  static get _retryThreshold() {
    return 1000 * 60 * 60;
  }

  static get _maxRetries() {
    return 10;
  }

  startPublisher () {
    var options = {
      host : config.get('redisHost'),
      port : config.get('redisPort'),
      //password: config.get('redis.password')
      retry_strategy: this._redisRetry
    };

    this.redisPub = redis.createClient(options);
  }

  startSubscriber () {
    let self = this;
    if (this.redisCli) {
      Logger.warn("[RedisWrapper] Redis Client already exists");
      return;
    }

    var options = {
      host : config.get('redisHost'),
      port : config.get('redisPort'),
      //password: config.get('redis.password')
      retry_strategy: this._redisRetry
    };

    this.redisCli = redis.createClient(options);

    this.redisCli.on("connect", () => {
      //TODO
    });

    this.redisCli.on("error", (error) => {
      Logger.error("[RedisWrapper] Wrapper returned an error", error);
    });

    this.redisCli.on("reconnecting", (msg) => {
      Logger.warn("[RedisWrapper] Wrapper instance is reconnecting", msg);
      //TODO
    });

    this.redisCli.on("psubscribe", (channel, count) => {
      Logger.info("[RedisWrapper] Successfully subscribed to pattern [" + channel + "]");
    });

    this.redisCli.on("pmessage", this._onMessage.bind(this));

    if (!this.subpattern) {
      throw new Error("[RedisWrapper] No subscriber pattern");
    }

    this.redisCli.psubscribe(this.subpattern);

    Logger.info("[RedisWrapper] Started Redis client at " + options.host + ":" + options.port +
        " for subscription pattern: " + this.subpattern);
  }

  stopRedis (callback) {
    if (this.redisCli){
      this.redisCli.quit();
    }
    callback(false);
  }

  publishToChannel (_message, channel) {
    let message = _message;
    if(this.redisPub) {
      this.redisPub.publish(channel, message);
    }
  }

  /* Private members */

  _onMessage (pattern, channel, _message) {
    let message = (typeof _message !== 'object')?JSON.parse(_message):_message;
    // use event emitter to throw new message
    this.emit(Constants.REDIS_MESSAGE, message);
  }

  static _redisRetry (options) {
    // if (options.error && options.error.code === 'ECONNREFUSED') {
    //   return new Error('The server refused the connection');
    // }
    if (options.total_retry_time > RedisWrapper._retryThreshold) {
      return new Error('Retry time exhausted');
    }
    if (options.times_connected > RedisWrapper._maxRetries) {
      return undefined;
    }
    return Math.max(options.attempt * 100, 3000);
  }
}
