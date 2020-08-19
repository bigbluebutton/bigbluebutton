import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

const logClient = function (type, logDescription, logCode = 'was_not_provided', extraInfo = {}, userInfo = {}) {
  const connectionId = this.connection.id;
  const User = Users.findOne({ connectionId });
  const logContents = {
    logCode,
    logDescription,
    connectionId,
    extraInfo,
    userInfo,
  };

  if (User) { // TODO--
    if ((userInfo.credentials && User.meetingId === userInfo.credentials.meetingId)
      || ((userInfo.meetingId && User.meetingId === userInfo.meetingId))) {
      logContents.extraInfo.validUser = 'valid';
    } else {
      logContents.extraInfo.validUser = 'invalid';
    }
  } else {
    logContents.extraInfo.validUser = 'notFound';
  }

  // If I don't pass message, logs will start with `undefined`
  Logger.log({ message: JSON.stringify(logContents), level: type });
  // Logger.log({ message: 'client->server', level: type, logContents });
};

export default logClient;
