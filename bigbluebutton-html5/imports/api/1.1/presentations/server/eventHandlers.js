import RedisPubSub from '/imports/startup/server/redis';
import handlePresentationRemove from './handlers/presentationRemove';
import handlePresentationChange from './handlers/presentationChange';
import handlePresentationInfoReply from './handlers/presentationInfoReply';

RedisPubSub.on('presentation_removed_message', handlePresentationRemove);
RedisPubSub.on('presentation_shared_message', handlePresentationChange);
RedisPubSub.on('get_presentation_info_reply', handlePresentationInfoReply);
