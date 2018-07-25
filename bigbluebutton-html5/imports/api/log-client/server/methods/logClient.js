import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

const logClient = function (type, log, ...args) {
  const SERVER_CONN_ID = this.connection.id;
  const User = Users.findOne({ connectionId: SERVER_CONN_ID });
  const logContents = { ...args };
  let validUser; // local variable that stores the future validUser value

  if (User) {
    if (User.meetingId === args[0].meetingId) {
      validUser = 'valid';
    } else {
      validUser = 'invalid';
    }
  } else {
    validUser = 'notFound';
  }
  if (args && args[0]) {
    args[0].validUser = validUser;
  }

  if (typeof log === 'string' || log instanceof String) {
    Logger.log(type, `CLIENT LOG: ${log}`, logContents);
  } else {
    Logger.log(type, `CLIENT LOG: ${JSON.stringify(log)}`, logContents);
  }
};

export default logClient;
