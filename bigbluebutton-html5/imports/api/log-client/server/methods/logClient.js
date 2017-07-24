import Logger from '/imports/startup/server/logger';

const logClient = () => {
  const args = Array.prototype.slice.call(arguments, 1);

  Logger.log(arguments[0], 'Client Log', args);
};

export default logClient;
