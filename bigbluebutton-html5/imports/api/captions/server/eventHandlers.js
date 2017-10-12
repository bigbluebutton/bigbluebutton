import RedisPubSub from '/imports/startup/server/redis';
import handleCaptionHistory from './handlers/captionHistory';
import handleCaptionUpdate from './handlers/captionUpdate';
import handleCaptionOwnerUpdate from './handlers/captionOwnerUpdate';

// TODO
RedisPubSub.on('SendCaptionHistoryRespMsg', handleCaptionHistory);
RedisPubSub.on('EditCaptionHistoryEvtMsg', handleCaptionUpdate);
RedisPubSub.on('UpdateCaptionOwnerEvtMsg', handleCaptionOwnerUpdate);
