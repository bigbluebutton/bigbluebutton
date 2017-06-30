import RedisPubSub from '/imports/startup/server/redis2x';
// import handleSlideResize from './handlers/slideResize';
import handleSlideChange from './handlers/slideChange';

// RedisPubSub.on('presentation_page_resized_message', handleSlideResize);
RedisPubSub.on('SetCurrentPageEvtMsg', handleSlideChange);
