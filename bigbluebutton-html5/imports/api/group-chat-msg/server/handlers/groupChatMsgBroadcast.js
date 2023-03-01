import { check } from 'meteor/check';
import throttle from 'lodash.throttle';
import addGroupChatMsg from '../modifiers/addGroupChatMsg';
import addBulkGroupChatMsgs from '../modifiers/addBulkGroupChatMsgs';

const { bufferChatInsertsMs } = Meteor.settings.public.chat;

const msgBuffer = [];

const bulkFn = throttle(addBulkGroupChatMsgs, bufferChatInsertsMs);

export default function handleGroupChatMsgBroadcast({ body }, meetingId) {
  const { chatId, msg } = body;

  check(meetingId, String);
  check(chatId, String);
  check(msg, Object);

  if (bufferChatInsertsMs) {
    msgBuffer.push({ meetingId, chatId, msg });
    bulkFn(msgBuffer);
  } else {
    addGroupChatMsg(meetingId, chatId, msg);
  }
}
