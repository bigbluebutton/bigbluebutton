const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  transports: [
    new transports.Console({ format: format.combine(format.timestamp(), format.splat(), format.json()) }),
    new transports.File({ filename: "log/application.log", format: format.combine(format.timestamp(), format.splat(), format.json()) })
  ]
});

module.exports = logger;

