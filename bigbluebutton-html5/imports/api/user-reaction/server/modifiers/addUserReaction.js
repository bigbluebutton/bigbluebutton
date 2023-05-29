import UserReaction from '/imports/api/user-reaction';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function addUserReaction(meetingId, userId, reaction) {
  check(meetingId, String);
  check(userId, String);
  check(reaction, String);

  const selector = {
    creationDate: new Date(),
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      meetingId,
      userId,
      reaction,
    },
  };

  try {
    UserReaction.remove({ meetingId, userId });
    const { numberAffected } = UserReaction.upsert(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Added user reaction meetingId=${meetingId} userId=${userId}`);
    }
  } catch (err) {
    Logger.error(`Adding user reaction: ${err}`);
  }
}
