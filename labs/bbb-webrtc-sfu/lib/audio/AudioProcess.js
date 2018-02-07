'use strict';

const AudioManager = require('./AudioManager');
const Logger = require('../utils/Logger');
const config = require('config');

if (config.get('acceptSelfSignedCertificate')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
}

let am = new AudioManager();

process.on('uncaughtException', (error) => {
  Logger.error('[AudioProcess] Uncaught exception ', error.stack);
});

process.on('disconnect', async () => {
  Logger.warn('[AudioProcess] Parent process exited, cleaning things up and finishing child now...');
  //TODO below
  //async AudioManager.stopAll();
  process.exit(0);
});

// Added this listener to identify unhandled promises, but we should start making
// sense of those as we find them
process.on('unhandledRejection', (reason, p) => {
  Logger.error('[AudioProcess] Unhandled Rejection at: Promise', p, 'reason:', reason);
});

// This basically starts the audio Manager routines which listens the connection
// manager messages routed to "to-sfu-audio"
am.start();
