import RedisPubSub from '/imports/startup/server/redis2x';
import handleCreateBreakout from './handlers/createBreakout';
import handleBreakoutJoinURL from './handlers/breakoutJoinURL';
import handleBreakoutStarted from './handlers/breakoutStarted';
import handleUpdateTimeRemaining from './handlers/updateTimeRemaining';
import handleBreakoutClosed from './handlers/breakoutClosed';

RedisPubSub.on('CreateBreakoutRoomEvtMsg', handleCreateBreakout);
RedisPubSub.on('BreakoutRoomStartedEvtMsg', handleBreakoutStarted);
RedisPubSub.on('BreakoutRoomJoinURLEvtMsg', handleBreakoutJoinURL);
RedisPubSub.on('BreakoutRoomsTimeRemainingUpdateEvtMsg', handleUpdateTimeRemaining);
RedisPubSub.on('EndBreakoutRoomEvtMsg', handleBreakoutClosed);
