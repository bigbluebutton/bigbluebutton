import flat from 'flat';
import { Match, check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import GroupChat from '/imports/api/group-chat';

export default function addGroupChat(meetingId, chat) {
  check(meetingId, String);
  check(chat, {
    id: Match.Maybe(String),
    chatId: Match.Maybe(String),
    correlationId: Match.Maybe(String),
    name: String,
    access: String,
    createdBy: Object,
    users: Array,
    msg: Match.Maybe(Array),
  });

  const chatDocument = {
    meetingId,
    chatId: chat.chatId || chat.id,
    name: chat.name,
    access: chat.access,
    users: chat.users.map(u => u.id),
    createdBy: chat.createdBy.id,
  };

  const selector = {
    chatId: chatDocument.chatId,
    meetingId,
  };

  const modifier = {
    $set: flat(chatDocument, { safe: true }),
  };

  try {
    const { insertedId } = GroupChat.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Added group-chat name=${chat.name} meetingId=${meetingId}`);
    } else {
      Logger.info(`Upserted group-chat name=${chat.name} meetingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding group-chat to collection: ${err}`);
  }
}
