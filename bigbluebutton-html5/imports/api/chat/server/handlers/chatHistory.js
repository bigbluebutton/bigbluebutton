import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';
import addChat from '../modifiers/addChat';

export default function handleChatHistory({ payload }) {
  if (!inReplyToHTML5Client({ payload })) {
    return;
  }

  const meetingId = payload.meeting_id;
  const chatHistory = payload.chat_history || [];

  check(meetingId, String);
  check(chatHistory, Array);

  let chatsAdded = [];

  chatHistory.forEach(message => {
    chatsAdded.push(addChat(meetingId, message));
  });

  return chatsAdded;
};
