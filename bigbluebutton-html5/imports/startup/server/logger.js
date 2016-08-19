import { Meteor } from 'meteor/meteor';
import Winston from 'winston';

let Logger = new Winston.Logger();

Meteor.startup(() => {
  const LOG_CONFIG = Meteor.settings.log || {};

  // Determine file to write logs to
  if (LOG_CONFIG.filename) {
    let filename = LOG_CONFIG.filename;

    if (Meteor.settings.runtime.env == 'production') {
      Logger.add(Winston.transports.File,
        { filename: LOG_CONFIG.filename,
          prettyPrint: true,
        });
    } else {
      Logger.add(Winston.transports.File,
        { filename: `${process.env.PWD}/` + LOG_CONFIG.filename,
          prettyPrint: true,
        });
    }
  }

  // Write logs to console
  Logger.add(Winston.transports.Console,
    { prettyPrint: true,
      humanReadableUnhandledException: true,
      colorize: true,
    }
  );
});

export default Logger;

export let logger = Logger;
