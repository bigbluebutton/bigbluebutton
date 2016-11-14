import RedisPubSub from '/imports/startup/server/redis';

import createBreakout from './handlers/createBreakout';
import breakoutStarted from './handlers/breakoutStarted';
import breakoutJoinURL from './handlers/breakoutJoinURL';
import updateTimeRemaining from './handlers/updateTimeRemaining';
import breakoutClosed from './handlers/breakoutClosed';

RedisPubSub.on('CreateBreakoutRoomRequest', createBreakout);
RedisPubSub.on('BreakoutRoomStarted', breakoutStarted);
RedisPubSub.on('BreakoutRoomJoinURL', breakoutJoinURL);
RedisPubSub.on('BreakoutRoomsTimeRemainingUpdate', updateTimeRemaining);
RedisPubSub.on('BreakoutRoomClosed', breakoutClosed);
