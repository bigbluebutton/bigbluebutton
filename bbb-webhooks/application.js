const config = require('config');
const Hook = require("./hook.js");
const IDMapping = require("./id_mapping.js");
const WebHooks = require("./web_hooks.js");
const WebServer = require("./web_server.js");
const redis = require("redis");
const UserMapping = require("./userMapping.js");
const async = require("async");

// Class that defines the application. Listens for events on redis and starts the
// process to perform the callback calls.
// TODO: add port (-p) and log level (-l) to the command line args
module.exports = class Application {

  constructor() {
    this.webHooks = new WebHooks();
    this.webServer = new WebServer();
  }

  start(callback) {
    Hook.initialize(() => {
      UserMapping.initialize(() => {
        IDMapping.initialize(()=> {
          async.parallel([
            (callback) => { this.webServer.start(config.get("server.port"), callback) },
            (callback) => { this.webServer.createPermanents(callback) },
            (callback) => { this.webHooks.start(callback) }
          ], (err,results) => {
            if(err != null) {}
            typeof callback === 'function' ? callback() : undefined;
          });
        });
      });
    });
  }

  static redisPubSubClient() {
    if (!Application._redisPubSubClient) {
      Application._redisPubSubClient = redis.createClient( { host: config.get("redis.host"), port: config.get("redis.port") } );
    }
    return Application._redisPubSubClient;
  }

  static redisClient() {
    if (!Application._redisClient) {
      Application._redisClient = redis.createClient( { host: config.get("redis.host"), port: config.get("redis.port") } );
    }
    return Application._redisClient;
  }
};
