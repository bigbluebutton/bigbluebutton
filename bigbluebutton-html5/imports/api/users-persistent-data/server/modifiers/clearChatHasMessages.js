import Logger from '/imports/startup/server/logger';
import UsersPersistentData from '/imports/api/users-persistent-data';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;

export default async function clearChatHasMessages(meetingId, chatId) {
  const selector = {
    meetingId,
  };

  const type = chatId === PUBLIC_GROUP_CHAT_KEY ? 'public' : 'private';

  const modifier = {
    $set: {
      [`shouldPersist.hasMessages.${type}`]: false,
    },
  };

  try {
    const numberAffected = await UsersPersistentData
      .updateAsync(selector, modifier, { multi: true });

    if (numberAffected) {
      Logger.info(`Cleared hasMessages meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Clear hasMessages error: ${err}`);
  }
}
