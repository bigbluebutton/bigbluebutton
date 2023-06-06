import { check } from 'meteor/check';
import addGroupChat from '../modifiers/addGroupChat';

export default async function handleGroupChatCreated({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  await addGroupChat(meetingId, body);
}
