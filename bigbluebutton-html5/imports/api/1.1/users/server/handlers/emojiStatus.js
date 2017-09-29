import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import Users from './../../';

export default function handleEmojiStatus({ payload }) {
  const meetingId = payload.meeting_id;
  const userId = payload.userid;
  const status = payload.emoji_status;

  check(meetingId, String);
  check(userId, String);
  check(status, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      'user.set_emoji_time': (new Date()).getTime(),
      'user.emoji_status': status,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Assigning user emoji status: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Assigned user emoji status${
         status} id=${userId} meeting=${meetingId}`,
      );
    }
  };

  return Users.update(selector, modifier, cb);
}
