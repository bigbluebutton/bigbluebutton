import RedisPubSub from '/imports/startup/server/redis';
import handleCaptionReply from './handlers/captionReply';
import handleCaptionUpdate from './handlers/captionUpdate';
import handleCaptionOwnerUpdate from './handlers/captionOwnerUpdate';

RedisPubSub.on('send_caption_history_reply_message', handleCaptionReply);
RedisPubSub.on('edit_caption_history_message', handleCaptionUpdate);
RedisPubSub.on('update_caption_owner_message', handleCaptionOwnerUpdate);
