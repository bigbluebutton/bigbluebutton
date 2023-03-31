import { check } from 'meteor/check';
import emitNotification from '/imports/api/meetings/server/modifiers/emitNotification';

export default function handleNotifyUserInMeeting({ body }) {
  check(body, {
    userId: String,
    meetingId: String,
    notificationType: String,
    icon: String,
    messageId: String,
    messageDescription: String,
    messageValues: Array,
  });
  return emitNotification(body, 'NotifyUserInMeeting');
}
