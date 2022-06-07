import { check } from 'meteor/check';
import addGroupChat from '../modifiers/addGroupChat';

export default function handleGroupChatCreated({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  addGroupChat(meetingId, body);
}
