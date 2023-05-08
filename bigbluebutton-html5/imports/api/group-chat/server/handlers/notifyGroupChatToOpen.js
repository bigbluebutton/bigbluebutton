import { check } from 'meteor/check';
import notifyGroupChat from '../modifiers/notifyGroupChat';

export default async function handleNotifyGroupChatToOpen({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  const { chatId } = body;

  await notifyGroupChat(meetingId, chatId);
}
