import RedisPubSub from '/imports/startup/server/redis';
import handleGroupChats from './handlers/groupChats';
import handleGroupChatCreated from './handlers/groupChatCreated';
import handleGroupChatDestroyed from './handlers/groupChatDestroyed';

RedisPubSub.on('GetGroupChatsRespMsg', handleGroupChats);
RedisPubSub.on('GroupChatCreatedEvtMsg', handleGroupChatCreated);
RedisPubSub.on('GroupChatDestroyedEvtMsg', handleGroupChatDestroyed);
