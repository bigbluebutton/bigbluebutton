import { check } from 'meteor/check';
import addChat from '../modifiers/addChat';

export default function handleChatMessage({ body }, meetingId) {
  const { message } = body;

  check(meetingId, String);
  check(message, Object);

  return addChat(meetingId, message);
}
