import Breakouts from '/imports/api/breakouts';
import updateUserBreakoutRoom from '/imports/api/users-persistent-data/server/modifiers/updateUserBreakoutRoom';
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

  try {
    const numberAffected = Breakouts.update(selector, modifier);

    if (numberAffected) {
      updateUserBreakoutRoom(parentId, breakoutId, users);

      Logger.info(`Updated joined users in breakout id=${breakoutId}`);
    }
  } catch (err) {
    Logger.error(`updating joined users in breakout: ${err}`);
  }
}
