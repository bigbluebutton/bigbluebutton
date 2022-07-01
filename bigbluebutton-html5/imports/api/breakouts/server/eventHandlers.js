import RedisPubSub from '/imports/startup/server/redis';
import handleBreakoutJoinURL from './handlers/breakoutJoinURL';
import handleBreakoutRoomsList from './handlers/breakoutList';
import handleUpdateTimeRemaining from './handlers/updateTimeRemaining';
import handleBreakoutClosed from './handlers/breakoutClosed';
import joinedUsersChanged from './handlers/joinedUsersChanged';
import userBreakoutChanged from '/imports/api/breakouts/server/handlers/userBreakoutChanged';

RedisPubSub.on('BreakoutRoomsListEvtMsg', handleBreakoutRoomsList);
RedisPubSub.on('BreakoutRoomJoinURLEvtMsg', handleBreakoutJoinURL);
RedisPubSub.on('BreakoutRoomsTimeRemainingUpdateEvtMsg', handleUpdateTimeRemaining);
RedisPubSub.on('BreakoutRoomEndedEvtMsg', handleBreakoutClosed);
RedisPubSub.on('UpdateBreakoutUsersEvtMsg', joinedUsersChanged);
RedisPubSub.on('ChangeUserBreakoutEvtMsg', userBreakoutChanged);
