const winston = require("winston");

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ timestamp: true, colorize: true }),
    new (winston.transports.File)({ filename: "log/application.log", timestamp: true })
  ]
});

module.exports = logger;
