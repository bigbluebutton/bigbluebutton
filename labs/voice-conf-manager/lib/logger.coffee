bunyan = require 'bunyan'

logger = bunyan.createLogger({
  name: 'bbbnode',
  streams: [
    {
      level: 'debug',
      stream: process.stdout,
    },
    {
      level: 'info',
      path: '/var/log/bigbluebutton/voice-conf-manager.log'
    }
  ]
});

module.exports = logger;
