import RedisPubSub from '/imports/startup/server/redis';
import handleSetUserReaction from './handlers/setUserReaction';
import handleClearUsersReaction from './handlers/clearUsersReaction';

RedisPubSub.on('UserReactionEmojiChangedEvtMsg', handleSetUserReaction);
RedisPubSub.on('ClearedAllUsersReactionEvtMsg', handleClearUsersReaction);
