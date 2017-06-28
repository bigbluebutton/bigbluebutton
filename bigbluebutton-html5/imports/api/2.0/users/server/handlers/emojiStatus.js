import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import Users from '/imports/api/2.0/users';

export default function handleEmojiStatus({ body , header }) {
  const { meetingId } = header;
  const { userId, status } = body;

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
