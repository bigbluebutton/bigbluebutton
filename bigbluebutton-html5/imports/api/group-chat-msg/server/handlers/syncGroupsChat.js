import { Match, check } from 'meteor/check';
import syncMeetingChatMsgs from '../modifiers/syncMeetingChatMsgs';

export default function handleSyncGroupChat({ body }, meetingId) {
  const { chatId, msgs } = body;

  check(meetingId, String);
  check(chatId, String);
  check(msgs, Match.Maybe(Array));

  syncMeetingChatMsgs(meetingId, chatId, msgs);
}
