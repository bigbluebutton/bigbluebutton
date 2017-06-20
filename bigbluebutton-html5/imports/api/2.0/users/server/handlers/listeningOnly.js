import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from './../../';

export default function handleListeningOnly({ payload }) {
  const meetingId = payload.meeting_id;
  const userId = payload.userid;
  const listenOnly = payload.listen_only;

  check(meetingId, String);
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
