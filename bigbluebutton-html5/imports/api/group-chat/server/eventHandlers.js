import RedisPubSub from '/imports/startup/server/redis';
import handleGroupChats from './handlers/groupChats';
import handleGroupChatCreated from './handlers/groupChatCreated';
import handleGroupChatDestroyed from './handlers/groupChatDestroyed';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';

RedisPubSub.on('GetGroupChatsRespMsg', processForHTML5ServerOnly(handleGroupChats));
RedisPubSub.on('GroupChatCreatedEvtMsg', handleGroupChatCreated);
RedisPubSub.on('GroupChatDestroyedEvtMsg', handleGroupChatDestroyed);
RedisPubSub.on('SyncGetGroupChatsRespMsg', handleGroupChats);
