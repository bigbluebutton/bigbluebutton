const ScreenshareManager = require('./ScreenshareManager');
const Logger = require('../utils/Logger');
const config = require('config');

if (config.get('acceptSelfSignedCertificate')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
}

let c = new ScreenshareManager();

process.on('uncaughtException', (error) => {
  Logger.error('[ScreenshareProcess] Uncaught exception ', error.stack);
});

process.on('disconnect', c.stopAll);

// Added this listener to identify unhandled promises, but we should start making
// sense of those as we find them
process.on('unhandledRejection', (reason, p) => {
  Logger.error('[ScreenshareProcess] Unhandled Rejection at: Promise', p, 'reason:', reason);
});

c.start();
