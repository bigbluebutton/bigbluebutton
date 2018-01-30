const Logger = require('../utils/Logger');
const config = require('config');

if (config.get('acceptSelfSignedCertificate')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
}

// This basically starts the video Manager routines which listens the connection
// manager messages routed to "to-sfu-video"
const VideoManager = require('./VideoManager');

process.on('uncaughtException', (error) => {
  Logger.error('[VideoProcess] Uncaught exception ', error.stack);
});

process.on('disconnect', () => {
  Logger.info("[VideoProcess] Parent process disconnected!");
});

// Added this listener to identify unhandled promises, but we should start making
// sense of those as we find them
process.on('unhandledRejection', (reason, p) => {
  Logger.error('[VideoProcess] Unhandled Rejection at: Promise', p, 'reason:', reason);
});
