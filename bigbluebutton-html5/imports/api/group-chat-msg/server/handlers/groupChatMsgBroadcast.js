import { check } from 'meteor/check';
import _ from 'lodash';
import addGroupChatMsg from '../modifiers/addGroupChatMsg';
import addBulkGroupChatMsgs from '../modifiers/addBulkGroupChatMsgs';

const { bufferChatInsertsMs } = Meteor.settings.public.chat;

const msgBuffer = [];

const bulkFn = _.throttle(addBulkGroupChatMsgs, bufferChatInsertsMs);

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
