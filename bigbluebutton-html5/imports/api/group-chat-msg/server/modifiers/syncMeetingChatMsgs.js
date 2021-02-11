import { Match, check } from 'meteor/check';
import flat from 'flat';
import { GroupChatMsg } from '/imports/api/group-chat-msg';
import Logger from '/imports/startup/server/logger';
import { parseMessage } from './addGroupChatMsg';

export default function syncMeetingChatMsgs(meetingId, chatId, msgs) {
  if (!msgs.length) return;

  check(meetingId, String);
  check(chatId, String);
  check(msgs, Match.Maybe(Array));

  try {
    const bulkOperations = GroupChatMsg.rawCollection().initializeOrderedBulkOp();

    msgs
      .forEach((msg) => {
        const msgToSync = {
          ...msg,
          meetingId,
          chatId,
          message: parseMessage(msg.message),
          sender: msg.sender.id,
        };

        const modifier = flat(msgToSync, { safe: true });

        bulkOperations
          .find({ chatId, meetingId, id: msg.id })
          .upsert()
          .updateOne({
            $setOnInsert: { _id: new Mongo.ObjectID()._str },
            $set: { ...modifier },
          });
      });

    bulkOperations.execute();

    Logger.info('Chat messages synchronized', { chatId, meetingId });
  } catch (err) {
    Logger.error(`Error on sync chat messages: ${err}`);
  }
}
