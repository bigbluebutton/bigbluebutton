import RedisPubSub from '/imports/startup/server/redis2x';
import handleBreakoutJoinURL from './handlers/breakoutJoinURL';
import handleBreakoutStarted from './handlers/breakoutStarted';
import handleUpdateTimeRemaining from './handlers/updateTimeRemaining';
import handleBreakoutClosed from './handlers/breakoutClosed';
import handleUpdateUsersEvtMsg from './handlers/updateUsersEvtMsg';

RedisPubSub.on('BreakoutRoomStartedEvtMsg', handleBreakoutStarted);
RedisPubSub.on('BreakoutRoomJoinURLEvtMsg', handleBreakoutJoinURL);
RedisPubSub.on('BreakoutRoomsTimeRemainingUpdateEvtMsg', handleUpdateTimeRemaining);
RedisPubSub.on('EndBreakoutRoomEvtMsg', handleBreakoutClosed);
RedisPubSub.on('UpdateBreakoutUsersEvtMsg', handleUpdateUsersEvtMsg);
