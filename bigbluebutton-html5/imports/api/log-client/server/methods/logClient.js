import Logger from '/imports/startup/server/logger';

const logClient = (type, log, ...args) => {
  Logger.log(type, `CLIENT LOG: ${log}\n`, ...args);
};

export default logClient;
