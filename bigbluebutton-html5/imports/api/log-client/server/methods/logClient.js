import Logger from '/imports/startup/server/logger';

const logClient = (type, log, ...args) => {
  if (typeof log === 'string' || log instanceof String) {
    Logger.log(type, `CLIENT LOG: ${log}\n`, ...args);
  } else {
    Logger.log(type, `CLIENT LOG: ${JSON.stringify(log)}\n`, ...args);
  }
};

export default logClient;
