import Logger from '/imports/startup/server/logger';
import UsersPersistentData from '/imports/api/users-persistent-data';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;

export default async function changeHasMessages(hasMessages, userId, meetingId, chatId) {
  const selector = {
    meetingId,
    userId,
  };

  const type = chatId === PUBLIC_GROUP_CHAT_KEY ? 'public' : 'private';

  const modifier = {
    $set: {
      [`shouldPersist.hasMessages.${type}`]: hasMessages,
    },
  };

  try {
    const numberAffected = await UsersPersistentData.updateAsync(selector, modifier);

    if (numberAffected) {
      Logger.info(`Changed hasMessages=${hasMessages} id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Change hasMessages error: ${err}`);
  }
}
