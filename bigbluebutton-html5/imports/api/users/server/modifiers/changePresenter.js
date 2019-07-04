import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function changePresenter(presenter, userId, meetingId, changedBy) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      presenter,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changed user role: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Changed presenter=${presenter} id=${userId} meeting=${meetingId}`
      + `${changedBy ? ` changedBy=${changedBy}` : ''}`);
    }

    return null;
  };

  return Users.update(selector, modifier, cb);
}
