import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import Users from '/imports/api/2.0/users';

const unassignCurrentPresenter = (meetingId, presenterId) => {
  const selector = {
    meetingId,
    userId: { $ne: presenterId },
    'user.presenter': true,
  };

  const modifier = {
    $set: {
      'user.presenter': false,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Unassigning current presenter from collection: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Unassign current presenter meeting=${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
};

export default function handlePresenterAssigned({ body }, meetingId) {
  const { presenterId } = body;

  check(presenterId, String);

  const selector = {
    meetingId,
    userId: presenterId,
  };

  const modifier = {
    $set: {
      'user.presenter': true,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Assigning user as presenter: ${err}`);
    }

    if (numChanged) {
      unassignCurrentPresenter(meetingId, presenterId);
      return Logger.info(`Assigned user as presenter id=${presenterId} meeting=${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
