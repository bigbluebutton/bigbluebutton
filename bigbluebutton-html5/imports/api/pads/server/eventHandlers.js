import RedisPubSub from '/imports/startup/server/redis';
import groupCreated from './handlers/groupCreated';
import padCreated from './handlers/padCreated';
import sessionCreated from './handlers/sessionCreated';
import padUpdated from './handlers/padUpdated';
import padContent from './handlers/padContent';
import padTail from './handlers/padTail';
import sessionDeleted from './handlers/sessionDeleted';

RedisPubSub.on('PadGroupCreatedRespMsg', groupCreated);
RedisPubSub.on('PadCreatedRespMsg', padCreated);
RedisPubSub.on('PadSessionCreatedRespMsg', sessionCreated);
RedisPubSub.on('PadUpdatedEvtMsg', padUpdated);
RedisPubSub.on('PadContentEvtMsg', padContent);
RedisPubSub.on('PadTailEvtMsg', padTail);
RedisPubSub.on('PadSessionDeletedEvtMsg', sessionDeleted);
