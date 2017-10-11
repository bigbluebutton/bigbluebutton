import { check } from 'meteor/check';
import addChat from '../modifiers/addChat';

export default function handleChatHistory({ body }, meetingId) {
  const { history } = body;

  check(meetingId, String);
  check(history, Array);

  const chatsAdded = [];

  history.forEach((message) => {
    chatsAdded.push(addChat(meetingId, message));
  });

  return chatsAdded;
}
