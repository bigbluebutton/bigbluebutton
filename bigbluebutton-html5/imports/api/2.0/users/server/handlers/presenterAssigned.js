import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import Users from './../../';

export default function handlePresenterAssigned({ body, header }) {
  const { meetingId } = header;
  const { intId } = body;

  check(meetingId, String);
  check(intId, String);

  const selector = {
    meetingId,
    userId: intId,
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
      unassignCurrentPresenter(meetingId, intId);
      return Logger.info(`Assigned user as presenter id=${intId} meeting=${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
}

const unassignCurrentPresenter = (meetingId, intId) => {
  const selector = {
    meetingId,
    userId: { $ne: intId },
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
