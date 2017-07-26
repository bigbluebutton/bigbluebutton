import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/2.0/users';

export default function handleListeningOnly({ payload }, meetingId) {
  const userId = payload.userId;
  const listenOnly = payload.listen_only;

  check(userId, String);
  check(listenOnly, Boolean);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      'user.listenOnly': listenOnly,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Assigning user listen only status: ${err}`);
    }

    if (numChanged) {
      return Logger.info(
        `Assigned listen only status '${listenOnly}' user=${userId} meeting=${meetingId}`,
      );
    }
  };

  return Users.update(selector, modifier, cb);
}
