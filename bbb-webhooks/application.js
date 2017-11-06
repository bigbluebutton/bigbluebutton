const config = require("./config.js");
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
    config.redis.pubSubClient = redis.createClient();
    config.redis.client = redis.createClient()
    this.webHooks = new WebHooks();
    this.webServer = new WebServer();
  }

  start(callback) {
    Hook.initialize(() => {
      UserMapping.initialize(() => {
        IDMapping.initialize(()=> {
          async.parallel([
            (callback) => { this.webServer.start(config.server.port, callback) },
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
};
