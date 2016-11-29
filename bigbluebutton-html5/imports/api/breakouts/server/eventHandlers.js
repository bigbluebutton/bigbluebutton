import RedisPubSub from '/imports/startup/server/redis';

import handleCreateBreakout from './handlers/createBreakout';
import handleBreakoutStarted from './handlers/breakoutStarted';
import handleBreakoutJoinURL from './handlers/breakoutJoinURL';
import handleUpdateTimeRemaining from './handlers/updateTimeRemaining';
import handleBreakoutClosed from './handlers/breakoutClosed';

RedisPubSub.on('CreateBreakoutRoomRequest', handleCreateBreakout);
RedisPubSub.on('BreakoutRoomStarted', handleBreakoutStarted);
RedisPubSub.on('BreakoutRoomJoinURL', handleBreakoutJoinURL);
RedisPubSub.on('BreakoutRoomsTimeRemainingUpdate', handleUpdateTimeRemaining);
RedisPubSub.on('BreakoutRoomClosed', handleBreakoutClosed);
