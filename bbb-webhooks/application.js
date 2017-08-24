const config = require("./config.js");
const Hook = require("./hook.js");
const IDMapping = require("./id_mapping.js");
const WebHooks = require("./web_hooks.js");
const WebServer = require("./web_server.js");

// Class that defines the application. Listens for events on redis and starts the
// process to perform the callback calls.
// TODO: add port (-p) and log level (-l) to the command line args
module.exports = class Application {

  constructor() {
    this.webHooks = new WebHooks();
    this.webServer = new WebServer();
  }

  start() {
    Hook.initialize(() => {
      IDMapping.initialize(() => {
        this.webServer.start(config.server.port);
        this.webServer.createPermanent();
        this.webHooks.start();
      });
    });
  }
};
