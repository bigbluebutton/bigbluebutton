import { UsersTyping } from '/imports/api/group-chat-msg';
import stopTyping from '../modifiers/stopTyping';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function stopUserTyping() {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const userTyping = UsersTyping.findOne({
    meetingId,
    userId: requesterUserId,
  });

  if (userTyping && meetingId && requesterUserId) {
    stopTyping(meetingId, requesterUserId, true);
  }
}
