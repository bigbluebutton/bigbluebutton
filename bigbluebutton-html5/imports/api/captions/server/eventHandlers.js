import RedisPubSub from '/imports/startup/server/redis';
import { skipFlashDirectEvent } from '/imports/api/common/server/helpers';
import handleCaptionHistory from './handlers/captionHistory';
import handleCaptionUpdate from './handlers/captionUpdate';
import handleCaptionOwnerUpdate from './handlers/captionOwnerUpdate';

// TODO
RedisPubSub.on('SendCaptionHistoryRespMsg', skipFlashDirectEvent(handleCaptionHistory));
RedisPubSub.on('EditCaptionHistoryEvtMsg', handleCaptionUpdate);
RedisPubSub.on('UpdateCaptionOwnerEvtMsg', handleCaptionOwnerUpdate);
