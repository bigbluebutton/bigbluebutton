import { eventEmitter } from '/imports/startup/server';
import { addChatToCollection } from '/imports/api/chat/server/modifiers/addChatToCollection';
import Meetings from '/imports/api/meetings';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';

eventEmitter.on('get_chat_history_reply', function (arg) {
  if (inReplyToHTML5Client(arg)) {
    const meetingId = arg.payload.meeting_id;
    if (Meetings.findOne({
        meetingId: meetingId,
      }) == null) {
      const chatHistory = arg.payload.chat_history;
      const chatHistoryLength = chatHistory.length;
      for (i = 0; i < chatHistoryLength; i++) {
        const chatMessage = chatHistory[i];
        addChatToCollection(meetingId, chatMessage);
      }
    }
  }

  return arg.callback();
});

eventEmitter.on('send_public_chat_message', function (arg) {
  handleChatEvent(arg);
});

eventEmitter.on('send_private_chat_message', function (arg) {
  handleChatEvent(arg);
});

const handleChatEvent = function (arg) {
  const messageObject = arg.payload.message;
  const meetingId = arg.payload.meeting_id;

  // use current_time instead of message.from_time so that the
  // chats from Flash and HTML5 have uniform times
  messageObject.from_time = +(arg.header.current_time);
  addChatToCollection(meetingId, messageObject);
  return arg.callback();
};
