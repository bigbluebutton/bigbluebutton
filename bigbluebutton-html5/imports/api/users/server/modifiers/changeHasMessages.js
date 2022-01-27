import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function changeHasMessages(hasMessages, userId, meetingId) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      hasMessages,
    },
  };

  try {
    const numberAffected = Users.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Changed hasMessages=${hasMessages} id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Change hasMessages error: ${err}`);
  }
}
