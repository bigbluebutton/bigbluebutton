import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import addChat from '../modifiers/addChat';

export default function handleChatMessage({ payload, header }) {
  const message = payload.message;
  const meetingId = payload.meeting_id;

  check(meetingId, String);
  check(message, Object);

  // use current_time instead of message.from_time so that the
  // chats from Flash and HTML5 have uniform times
  message.from_time = +(header.current_time);

  return addChat(meetingId, message);
};
