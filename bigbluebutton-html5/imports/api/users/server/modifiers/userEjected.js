import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import UsersPersistentData from '/imports/api/users-persistent-data';
import clearUserInfoForRequester from '/imports/api/users-infos/server/modifiers/clearUserInfoForRequester';

export default function userEjected(meetingId, userId, ejectedReason) {
  check(meetingId, String);
  check(userId, String);
  check(ejectedReason, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      ejected: true,
      ejectedReason,
    },
  };

  try {
    const numberAffected = UsersPersistentData.update(selector, modifier);

    if (numberAffected) {
      clearUserInfoForRequester(meetingId, userId);
      Logger.info(`Ejected user id=${userId} meeting=${meetingId} reason=${ejectedReason}`);
    }
  } catch (err) {
    Logger.error(`Ejecting user from collection: ${err}`);
  }
}
