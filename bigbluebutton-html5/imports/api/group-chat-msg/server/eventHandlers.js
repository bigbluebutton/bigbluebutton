import RedisPubSub from '/imports/startup/server/redis';
import handleGroupChatsMsgs from './handlers/groupChatsMsgs';
import handleGroupChatMsgBroadcast from './handlers/groupChatMsgBroadcast';
import handleClearPublicGroupChat from './handlers/clearPublicGroupChat';

RedisPubSub.on('GetGroupChatMsgsRespMsg', handleGroupChatsMsgs);
RedisPubSub.on('GroupChatMessageBroadcastEvtMsg', handleGroupChatMsgBroadcast);
RedisPubSub.on('ClearPublicChatHistoryEvtMsg', handleClearPublicGroupChat);
RedisPubSub.on('SyncGetGroupChatMsgsRespMsg', handleGroupChatsMsgs);
