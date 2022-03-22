import Logger from '/imports/startup/server/logger';
import UsersPersistentData from '/imports/api/users-persistent-data';

export default function changeHasMessages(hasMessages, userId, meetingId) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      'shouldPersist.hasMessages': hasMessages,
    },
  };

  try {
    const numberAffected = UsersPersistentData.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Changed hasMessages=${hasMessages} id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Change hasMessages error: ${err}`);
  }
}
