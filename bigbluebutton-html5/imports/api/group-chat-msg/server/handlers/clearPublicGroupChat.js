import { check } from 'meteor/check';
import clearGroupChatMsg from '../modifiers/clearGroupChatMsg';

export default async function clearPublicChatHistory({ header, body }) {
  const { meetingId } = header;
  const { chatId } = body;

  check(meetingId, String);
  check(chatId, String);

  const result = clearGroupChatMsg(meetingId, chatId);
  return result;
}
