import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import { check } from 'meteor/check';

export default async function changeUserChatLock(meetingId, payload) {
  check(meetingId, String);
  check(payload, {
    userId: String,
    isLocked: Boolean,
  });

  const { userId, isLocked } = payload;

  const userSelector = {
    meetingId,
    userId,
  };

  const userModifier = {
    $set: {
      chatLocked: isLocked,
    },
  };

  try {
    const { numberAffected } = await Users.upsertAsync(userSelector, userModifier);

    if ( numberAffected ) {
      Logger.info(`Updated lock settings in meeting ${meetingId}: disablePublicChat=${isLocked}`);
    } else {
      Logger.info(`Kept lock settings in meeting ${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Changing user chat lock setting: ${err}`);
  }
}
