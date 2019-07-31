import { check } from 'meteor/check';
import Users from '/imports/api/users';
import stopTyping from '../modifiers/stopTyping';

export default function stopUserTyping(credentials) {
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  const user = Users.findOne({
    userId: requesterUserId,
    meetingId,
  }, {
    fields: {
      isTyping: 1,
    },
  });

  if (user && user.isTyping) {
    stopTyping(meetingId, requesterUserId);
  }
}
