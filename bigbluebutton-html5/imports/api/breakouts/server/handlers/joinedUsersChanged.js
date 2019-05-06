import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function joinedUsersChanged({ body }) {
  check(body, Object);

  const {
    parentId,
    breakoutId,
    users,
  } = body;

  check(parentId, String);
  check(breakoutId, String);
  check(users, Array);

  const selector = {
    parentMeetingId: parentId,
    breakoutId,
  };

  const usersMapped = users.map(user => ({ userId: user.id, name: user.name }));
  const modifier = {
    $set: {
      joinedUsers: usersMapped,
    },
  };


  const cb = (err) => {
    if (err) {
      return Logger.error(`updating joined users in breakout: ${err}`);
    }

    return Logger.info('Updated joined users '
      + `in breakout id=${breakoutId}`);
  };
  Breakouts.find(selector);
  Breakouts.update(selector, modifier, cb);
}
