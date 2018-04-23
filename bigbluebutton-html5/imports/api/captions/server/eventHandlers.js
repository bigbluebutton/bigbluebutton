import RedisPubSub from '/imports/startup/server/redis';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';
import handleCaptionHistory from './handlers/captionHistory';
import handleCaptionUpdate from './handlers/captionUpdate';
import handleCaptionOwnerUpdate from './handlers/captionOwnerUpdate';

// TODO
RedisPubSub.on('SendCaptionHistoryRespMsg', processForHTML5ServerOnly(handleCaptionHistory));
RedisPubSub.on('EditCaptionHistoryEvtMsg', handleCaptionUpdate);
RedisPubSub.on('UpdateCaptionOwnerEvtMsg', handleCaptionOwnerUpdate);
