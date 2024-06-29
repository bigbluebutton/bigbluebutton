import Logger from '/imports/startup/server/logger';

export default function (type, logDescription, logCode = 'was_not_provided', extraInfo = {}, userInfo = {}) {
  const connectionId = this.connection.id;
  const logContents = {
    logCode,
    logDescription,
    connectionId,
    extraInfo,
    userInfo,
  };

  // If I don't pass message, logs will start with `undefined`
  Logger.log({ message: JSON.stringify(logContents), level: type });
}
