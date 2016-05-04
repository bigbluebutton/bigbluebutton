// Setting up a logger in Meteor.log
const log = {};
if (process != null && process.env != null && process.env.NODE_ENV == 'production') {
  log.path = '/var/log/bigbluebutton/bbbnode.log';
} else {
  log.path = `${process.env.PWD}/log/development.log`;
}

export let logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console(), new Winston.transports.File({
      filename: log.path,
    }),
  ],
});
