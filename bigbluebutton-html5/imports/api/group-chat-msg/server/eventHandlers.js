import RedisPubSub from '/imports/startup/server/redis';
import handleGroupChatsMsgs from './handlers/groupChatsMsgs';
import handleGroupChatMsgBroadcast from './handlers/groupChatMsgBroadcast';
import handleClearPublicGroupChat from './handlers/clearPublicGroupChat';
import handleUserTyping from './handlers/userTyping';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';

RedisPubSub.on('GetGroupChatMsgsRespMsg', processForHTML5ServerOnly(handleGroupChatsMsgs));
RedisPubSub.on('GroupChatMessageBroadcastEvtMsg', handleGroupChatMsgBroadcast);
RedisPubSub.on('ClearPublicChatHistoryEvtMsg', handleClearPublicGroupChat);
RedisPubSub.on('SyncGetGroupChatMsgsRespMsg', handleGroupChatsMsgs);
RedisPubSub.on('UserTypingEvtMsg', handleUserTyping);
