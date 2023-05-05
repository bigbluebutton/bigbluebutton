import { check } from 'meteor/check';
import addGroupChat from '../modifiers/addGroupChat';

export default function handleGroupChats({ body }, meetingId) {
  const { chats } = body;

  check(meetingId, String);
  check(chats, Array);

  chats.forEach(chat => addGroupChat(meetingId, chat));
}
