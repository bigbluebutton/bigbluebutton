import { Match, check } from 'meteor/check';
import addGroupChatMsg from '../modifiers/addGroupChatMsg';

export default function handleGroupChatsMsgs({ body }, meetingId) {
  const { chatId, msgs, msg } = body;

  check(meetingId, String);
  check(chatId, String);
  check(msgs, Match.Maybe(Array));
  check(msg, Match.Maybe(Array));

  const msgsAdded = [];

  (msgs || msg).forEach((m) => {
    msgsAdded.push(addGroupChatMsg(meetingId, chatId, m));
  });

  return msgsAdded;
}
