import RedisPubSub from '/imports/startup/server/redis';
import handlePresentationRemove from './handlers/presentationRemove';
import handlePresentationChange from './handlers/presentationChange';
import handlePresentationInfoReply from './handlers/presentationInfoReply';
import handlePresentationConversionUpdate from './handlers/presentationConversionUpdate';
import handlePresentationConversionDone from './handlers/presentationConversionDone';

RedisPubSub.on('presentation_removed_message', handlePresentationRemove);
RedisPubSub.on('presentation_shared_message', handlePresentationChange);
RedisPubSub.on('get_presentation_info_reply', handlePresentationInfoReply);
RedisPubSub.on('presentation_conversion_progress_message', handlePresentationConversionUpdate);
RedisPubSub.on('presentation_page_generated_message', handlePresentationConversionUpdate);
RedisPubSub.on('presentation_conversion_done_message', handlePresentationConversionDone);
