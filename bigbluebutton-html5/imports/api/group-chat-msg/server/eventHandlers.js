import RedisPubSub from '/imports/startup/server/redis';
import handleGroupChatsMsgs from './handlers/groupChatsMsgs';
import handleGroupChatMsgBroadcast from './handlers/groupChatMsgBroadcast';

RedisPubSub.on('GetGroupChatMsgsRespMsg', handleGroupChatsMsgs);
RedisPubSub.on('GroupChatMessageBroadcastEvtMsg', handleGroupChatMsgBroadcast);
