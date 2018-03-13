'use strict'

const Logger = require('../utils/Logger');
const config = require('config');

module.exports = class BaseProcess {
  constructor(manager, logPrefix) {
    this.runningState = "RUNNING";
    this.manager = manager;
    this.logPrefix = logPrefix;
  }

  start () {
    try {
    this.manager.start();

    if (config.get('acceptSelfSignedCertificate')) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
    }

    process.on('disconnect', this.stop.bind(this));
    process.on('SIGTERM', this.stop.bind(this));
    process.on('SIGINT', this.stop.bind(this));
    process.on('uncaughtException', this.handleException.bind(this));
    process.on('unhandledRejection', this.handleRejection.bind(this));
    this.manager.sti();
    }
    catch (err) {
      throw new Error(err);
    }
  }

  async stop () {
    try {
      await this.manager.stopAll();
      Logger.info(this.logPrefix, "Exiting screenshare process");
      process.exit(0);

    }
    catch (err) {
      Logger.error(this.logPrefix, err);
      process.exit(1);
    }
  }

  handleException (error) {
    process.exit(1);
    Logger.error(this.logPrefix, 'TODO => Uncaught exception', error.stack);
  }

  handleRejection (reason, promise) {
    Logger.error(this.logPrefix, 'Unhandled Rejection at: Promise', p, 'reason:', reason);
  }
}
