import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

const logClient = function (type, log, ...args) {
  const SERVER_CONN_ID = this.connection.id;
  const User = Users.findOne({ connectionId: SERVER_CONN_ID });
  const logContents = { ...args };

  if (User) {
    const {
      meetingId, name, intId, extId, authToken,
    } = User;
    const serverInfo = {
      meetingId,
      userName: name,
      userIntId: intId,
      userExtId: extId,
      authToken,
    };
    logContents.serverInfo = serverInfo;
  }

  if (typeof log === 'string' || log instanceof String) {
    Logger.log(type, `CLIENT LOG: ${log}\n`, logContents);
  } else {
    Logger.log(type, `CLIENT LOG: ${JSON.stringify(log)}\n`, logContents);
  }
};

export default logClient;
