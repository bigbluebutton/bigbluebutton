import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

const logClient = function (type, log, fullInfo) {
  const SERVER_CONN_ID = this.connection.id;
  const User = Users.findOne({ connectionId: SERVER_CONN_ID });
  const logContents = { fullInfo };

  if (User) {
    if (User.meetingId === fullInfo.meetingId) {
      logContents.validUser = 'valid';
    } else {
      logContents.validUser = 'invalid';
    }
  } else {
    logContents.validUser = 'notFound';
  }

  if (typeof log === 'string' || log instanceof String) {
    Logger.log(type, `CLIENT LOG: ${log}`, logContents);
  } else {
    Logger.log(type, `CLIENT LOG: ${JSON.stringify(log)}`, logContents);
  }
};

export default logClient;
