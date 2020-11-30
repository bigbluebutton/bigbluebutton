import { Match, check } from 'meteor/check';
import addBulkGroupChatMsgs from '../modifiers/addBulkGroupChatMsgs';

export default function handleSyncGroupChat({ body }, meetingId) {
  const { chatId, msgs } = body;

  check(meetingId, String);
  check(chatId, String);
  check(msgs, Match.Maybe(Array));

  addBulkGroupChatMsgs(msgs);
}
