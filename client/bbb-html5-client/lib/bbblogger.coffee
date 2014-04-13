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
      path: '/var/log/bigbluebutton/bbbnode.log'
    }
  ]
});

module.exports = logger;
