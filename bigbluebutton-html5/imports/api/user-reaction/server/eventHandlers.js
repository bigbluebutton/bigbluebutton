import RedisPubSub from '/imports/startup/server/redis';
import handleSetUserReaction from './handlers/setUserReaction';

RedisPubSub.on('UserEmojiChangedEvtMsg', handleSetUserReaction);
