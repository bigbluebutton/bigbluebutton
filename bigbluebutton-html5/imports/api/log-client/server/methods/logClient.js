import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

const logClient = (type, log, ...args) => {
  const SERVER_CONN_ID = Object.keys(this.Meteor.default_server.sessions)[0];
  const User = Users.findOne({ connectionId: SERVER_CONN_ID });

  const userInfo = {
    meetingId: User.meetingId,
    userName: User.name,
    intId: User.intId,
    extId: User.extId,
    authToken: User.authToken,
  };

  const logContents = Array(...args).concat(userInfo);

  if (typeof log === 'string' || log instanceof String) {
    Logger.log(type, `CLIENT LOG: ${log}\n`, logContents);
  } else {
    Logger.log(type, `CLIENT LOG: ${JSON.stringify(log)}\n`, logContents);
  }
};

export default logClient;
