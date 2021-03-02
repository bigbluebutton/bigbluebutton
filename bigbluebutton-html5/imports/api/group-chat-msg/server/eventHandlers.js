import RedisPubSub from '/imports/startup/server/redis';
import handleGroupChatMsgBroadcast from './handlers/groupChatMsgBroadcast';
import handleClearPublicGroupChat from './handlers/clearPublicGroupChat';
import handleUserTyping from './handlers/userTyping';
import handleSyncGroupChatMsg from './handlers/syncGroupsChat';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';

RedisPubSub.on('GetGroupChatMsgsRespMsg', processForHTML5ServerOnly(handleSyncGroupChatMsg));
RedisPubSub.on('GroupChatMessageBroadcastEvtMsg', handleGroupChatMsgBroadcast);
RedisPubSub.on('ClearPublicChatHistoryEvtMsg', handleClearPublicGroupChat);
RedisPubSub.on('SyncGetGroupChatMsgsRespMsg', handleSyncGroupChatMsg);
RedisPubSub.on('UserTypingEvtMsg', handleUserTyping);
