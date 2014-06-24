###
bunyan = Meteor.require 'bunyan'

logger = bunyan.createLogger({
  name: 'bbbnode',
  streams: [
    {
      level: 'debug',
      stream: process.stdout,
    },
    {
      level: 'info',
      path: Meteor.config.log.path
    }
  ]
})
###
