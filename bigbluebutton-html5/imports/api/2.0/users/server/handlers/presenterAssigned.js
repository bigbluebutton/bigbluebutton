import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import Users from '/imports/api/2.0/users';

const unassignCurrentPresenter = (meetingId, presenterId) => {
  const selector = {
    meetingId,
    userId: { $ne: presenterId },
    presenter: true,
  };

  const modifier = {
    $set: {
      presenter: false,
    },
    $pop: {
      roles: 'presenter',
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Unassigning current presenter from collection: ${err}`);
    }

    return Logger.info(`Unassign current presenter meeting=${meetingId}`);
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
      presenter: true,
    },
    $push: {
      roles: 'presenter',
    },
  };

  const cb = (err, numChange) => {
    if (err) {
      return Logger.error(`Assigning user as presenter: ${err}`);
    }

    if (numChange) {
      unassignCurrentPresenter(meetingId, presenterId);
      return Logger.info(`Assigned user as presenter id=${presenterId} meeting=${meetingId}`);
    }

    return Logger.info(`User not assigned as presenter id=${presenterId} meeting=${meetingId}`);
  };

  return Users.update(selector, modifier, cb);
}
