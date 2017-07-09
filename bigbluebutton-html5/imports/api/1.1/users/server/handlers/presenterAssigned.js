import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import Users from './../../';

export default function handlePresenterAssigned({ payload }) {
  const meetingId = payload.meeting_id;
  const newPresenterId = payload.new_presenter_id;

  check(meetingId, String);
  check(newPresenterId, String);

  const selector = {
    meetingId,
    userId: newPresenterId,
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
      unassignCurrentPresenter(meetingId, newPresenterId);
      return Logger.info(`Assigned user as presenter id=${newPresenterId} meeting=${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
}

const unassignCurrentPresenter = (meetingId, newPresenterId) => {
  const selector = {
    meetingId,
    userId: { $ne: newPresenterId },
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
