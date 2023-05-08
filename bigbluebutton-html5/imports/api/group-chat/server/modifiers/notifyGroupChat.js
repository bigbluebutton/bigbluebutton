import flat from 'flat';
import { Match, check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import GroupChat from '/imports/api/group-chat';

export default async function notifyGroupChat(meetingId, chatId) {
  check(meetingId, String);
  check(chatId, String);

  const selector = {
    chatId,
    meetingId,
  };

  const modifier = {
    $set: {notified: true},
  };

  try {
    const { insertedId } = await GroupChat.upsertAsync(selector, modifier);

    if (insertedId) {
      Logger.info(`Added group-chat chatId=${chatId} meetingId=${meetingId}`);
    } else {
      Logger.info(`Upserted group-chat chatId=${chatId} meetingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding group-chat to collection: ${err}`);
  }
}
