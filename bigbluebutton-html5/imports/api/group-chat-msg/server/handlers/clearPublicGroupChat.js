import { check } from 'meteor/check';
import clearGroupChatMsg from '../modifiers/clearGroupChatMsg';

export default function clearPublicChatHistory({ header, body }) {
  const { meetingId } = header;
  const { chatId } = body;

  check(meetingId, String);
  check(chatId, String);

  return clearGroupChatMsg(meetingId, chatId);
}
