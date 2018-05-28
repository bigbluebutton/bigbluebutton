import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

const logClient = function (type, log, ...args) {
  const SERVER_CONN_ID = this.connection.id;
  const User = Users.findOne({ connectionId: SERVER_CONN_ID });
  let logContents = Array(...args);

  if (User !== undefined) {
    const {
      meetingId, name, intId, extId, authToken,
    } = User;
    const userInfo = {
      meetingId,
      userName: name,
      intId,
      extId,
      authToken,
    };
    logContents = Array(...args).concat(userInfo);
  }

  if (typeof log === 'string' || log instanceof String) {
    Logger.log(type, `CLIENT LOG: ${log}\n`, logContents);
  } else {
    Logger.log(type, `CLIENT LOG: ${JSON.stringify(log)}\n`, logContents);
  }
};

export default logClient;
