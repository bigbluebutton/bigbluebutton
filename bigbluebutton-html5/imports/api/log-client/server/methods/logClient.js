import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

const logClient = function (type, log, ...args) {
  const SERVER_CONN_ID = this.connection.id;
  const User = Users.findOne({ connectionId: SERVER_CONN_ID });
  const logContents = { ...args };

  if (User) {
    if (User.meetingId === args[0].meetingId) {
      args[0].validUser = 'vaild';
    } else {
      args[0].validUser = 'invaild';
    }
  } else {
    args[0].validUser = 'notFound';
  }

  if (typeof log === 'string' || log instanceof String) {
    Logger.log(type, `CLIENT LOG: ${log}`, logContents);
  } else {
    Logger.log(type, `CLIENT LOG: ${JSON.stringify(log)}`, logContents);
  }
};

export default logClient;
