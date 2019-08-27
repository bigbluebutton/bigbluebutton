import { check } from 'meteor/check';
import { UsersTyping } from '/imports/api/group-chat-msg';
import stopTyping from '../modifiers/stopTyping';

export default function stopUserTyping(credentials) {
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  const userTyping = UsersTyping.findOne({
    meetingId,
    userId: requesterUserId,
  });

  if (userTyping) {
    stopTyping(meetingId, requesterUserId, true);
  }
}
