import { check } from 'meteor/check';
import addGroupChat from '../modifiers/addGroupChat';

export default async function handleGroupChats({ body }, meetingId) {
  const { chats } = body;

  check(meetingId, String);
  check(chats, Array);

  await new Promise
    .all(chats.map(async (chat) => {
      await addGroupChat(meetingId, chat);
    }));
}
