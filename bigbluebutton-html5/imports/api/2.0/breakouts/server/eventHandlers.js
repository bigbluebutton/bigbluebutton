import RedisPubSub from '/imports/startup/server/redis2x';

import handleCreateBreakout from './handlers/createBreakout';
//import handleBreakoutStarted from './handlers/breakoutStarted';
import handleBreakoutJoinURL from './handlers/breakoutJoinURL';
import handleUpdateTimeRemaining from './handlers/updateTimeRemaining';
import handleBreakoutClosed from './handlers/breakoutClosed';

RedisPubSub.on('CreateBreakoutRoomEvtMsg', handleCreateBreakout);
//TODO - check how to handle
//RedisPubSub.on('BreakoutRoomStartedEvtMsg', handleBreakoutStarted);
RedisPubSub.on('BreakoutRoomJoinURLEvtMsg', handleBreakoutJoinURL);
RedisPubSub.on('BreakoutRoomsTimeRemainingUpdateEvtMsg', handleUpdateTimeRemaining);
RedisPubSub.on('EndBreakoutRoomEvtMsg', handleBreakoutClosed);
