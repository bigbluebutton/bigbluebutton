import RedisPubSub from '/imports/startup/server/redis';
import handleSlideResize from './handlers/slideResize';
import handleSlideChange from './handlers/slideChange';

RedisPubSub.on('ResizeAndMovePageEvtMsg', handleSlideResize);
RedisPubSub.on('SetCurrentPageEvtMsg', handleSlideChange);
