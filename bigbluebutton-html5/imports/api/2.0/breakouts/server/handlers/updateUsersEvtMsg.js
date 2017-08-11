import Logger from '/imports/startup/server/logger';
import Breakouts from '/imports/api/2.0/breakouts';

export default function handleUpdateUsersEvtMsg({ body }) {
  const {
    breakoutId,
    users,
  } = body;

  const selector = {
    breakoutId,
  };

  const modifier = {
    $set: {
      users,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Updating breakouts: ${err}`);
    }

    return Logger.info('Updated breakout time remaining for breakouts ' +
      `where parentMeetingId=${breakoutId}`);
  };

  return Breakouts.update(selector, modifier, cb);
}
