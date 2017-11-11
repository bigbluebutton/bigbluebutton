'use strict';

// incomplete

module.exports = class RedisConnectionManager {

  constructor(options) {

    this._client = redis.createClient({options});
    this._pubchannel = options.pubchannel;
    this._subchannel = optiosn.subchannel;

    if (options.pubchannel) {
      this._client.on()
    }

    if (options.subchannel) {
      this._client.on()
    }

    this._client.on()
    // pub

  }

  setEventEmitter(emitter) {
    this.emitter = emitter;
  }

  _onMessage() {

  }

}
