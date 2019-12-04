import { check } from 'meteor/check';
import addGroupChat from '../modifiers/addGroupChat';

export default function handleGroupChatDestroyed({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  return addGroupChat(meetingId, body);
}
