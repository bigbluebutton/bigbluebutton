import { check } from 'meteor/check';
import { UsersTyping } from '/imports/api/group-chat-msg';
import startTyping from '../modifiers/startTyping';

export default function handleUserTyping({ body }, meetingId) {
  const { chatId, userId } = body;

  check(meetingId, String);
  check(userId, String);
  check(chatId, String);

  startTyping(meetingId, userId, chatId);
}
