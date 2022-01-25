import RedisPubSub from '/imports/startup/server/redis';
import captionsOwnerUpdated from './handlers/captionsOwnerUpdated';

RedisPubSub.on('UpdateCaptionOwnerEvtMsg', captionsOwnerUpdated);
