import { check } from 'meteor/check';
import Users from '/imports/api/users';
import startTyping from '../modifiers/startTyping';

export default function handleUserTyping({ body }, meetingId) {
  const { chatId, userId } = body;

  check(meetingId, String);
  check(userId, String);
  check(chatId, String);

  const user = Users.findOne({
    userId,
    meetingId,
  }, {
    fields: {
      isTyping: 1,
    },
  });

  if (user && !user.isTyping) {
    startTyping(meetingId, userId, chatId);
  }
}
