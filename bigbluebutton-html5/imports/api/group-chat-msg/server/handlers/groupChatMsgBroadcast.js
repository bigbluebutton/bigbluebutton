import { check } from 'meteor/check';
import addGroupChatMsg from '../modifiers/addGroupChatMsg';

export default function handleGroupChatMsgBroadcast({ body }, meetingId) {
  const { chatId, msg } = body;

  check(meetingId, String);
  check(chatId, String);
  check(msg, Object);

  return addGroupChatMsg(meetingId, chatId, msg);
}
