import { GroupChatMsg } from '/imports/api/group-chat-msg';
import Logger from '/imports/startup/server/logger';
import flat from 'flat';
import { parseMessage } from './addGroupChatMsg';

export default async function addBulkGroupChatMsgs(msgs) {
  if (!msgs.length) return;

  const mappedMsgs = msgs
    .map(({ chatId, meetingId, msg }) => {
      const {
        sender,
        ...restMsg
      } = msg;

      return {
        _id: new Mongo.ObjectID()._str,
        ...restMsg,
        meetingId,
        chatId,
        message: parseMessage(msg.message),
        sender: sender.id,
        senderName: sender.name,
        senderRole: sender.role
      };
    })
    .map(el => flat(el, { safe: true }));

  try {
    const { insertedCount } = await GroupChatMsg.rawCollection().insertMany(mappedMsgs);
    msgs.length = 0;

    if (insertedCount) {
      Logger.info(`Inserted ${insertedCount} messages`);
    }
  } catch (err) {
    Logger.error(`Error on bulk insert. ${err}`);
  }
}
