import Polls from '/imports/api/polls';
import Users from '/imports/api/users';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import flat from 'flat';

export default function removePoll(meetingId, id, userId) {
  check(meetingId, String);
  check(id, String);

  const selector = {
    meetingId,
    id,
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Removing Poll from collection: ${err}`);
    }

    return Logger.info(`Removed Poll id=${id}`);
  };

  const sel = {
    meetingId,
    hasPoll: true,
  };

  const u = Users.findOne(sel);

  Users.upsert(sel, { $unset: { hasPoll: false, poll: flat(u.poll) } }, (err) => {
    if (err) {
      return Logger.error(`Removing Poll from User: ${err}`);
    }

    return Logger.info(`Removed Poll from userId=${userId}`);
  });

  return Polls.remove(selector, cb);
}
