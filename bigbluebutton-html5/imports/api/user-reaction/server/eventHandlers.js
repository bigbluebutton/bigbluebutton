import RedisPubSub from '/imports/startup/server/redis';
import handleSetUserReaction from './handlers/setUserReaction';
import handleClearUsersEmoji from './handlers/clearUsersEmoji';

RedisPubSub.on('UserEmojiChangedEvtMsg', handleSetUserReaction);
RedisPubSub.on('ClearedAllUsersEmojiEvtMsg', handleClearUsersEmoji);
