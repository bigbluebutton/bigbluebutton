'use strict'

const Logger = require('../utils/Logger');
const config = require('config');
const C = require('../bbb/messages/Constants');

module.exports = class BaseProcess {
  constructor(manager, logPrefix = C.BASE_PROCESS_PREFIX) {
    this.runningState = "RUNNING";
    this.manager = manager;
    this.logPrefix = logPrefix;
  }

  start () {
    this.manager.start();

    if (config.get('acceptSelfSignedCertificate')) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
    }

    process.on('disconnect', this.stop.bind(this));
    process.on('SIGTERM', this.stop.bind(this));
    process.on('SIGINT', this.stop.bind(this));
    process.on('uncaughtException', this.handleException.bind(this));
    process.on('unhandledRejection', this.handleRejection.bind(this));
  }

  async stop () {
    try {
      this.runningState = "STOPPING";
      await this.manager.stopAll();
      Logger.info(this.logPrefix, "Exiting process with code 0");
      process.exit();
    }
    catch (err) {
      Logger.error(this.logPrefix, err);
      Logger.info(this.logPrefix, "Exiting process with code 1");
      process.exit(1);
    }
  }

  handleException (error) {
    Logger.error(this.logPrefix, 'TODO => Uncaught exception', error.stack);
    if (this.runningState === "STOPPING") {
      Logger.warn(this.logPrefix, "Exiting process with code 1");
      process.exit(1);
    }
  }

  handleRejection (reason, promise) {
    Logger.error(this.logPrefix, 'TODO => Unhandled Rejection at: Promise', promise, 'reason:', reason);
    if (this.runningState === "STOPPING") {
      Logger.warn(this.logPrefix, "Exiting process with code 1");
      process.exit(1);
    }
  }
}
