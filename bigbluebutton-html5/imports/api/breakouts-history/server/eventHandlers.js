import RedisPubSub from '/imports/startup/server/redis';
import handleBreakoutRoomsList from './handlers/breakoutRoomsList';

RedisPubSub.on('BreakoutRoomsListEvtMsg', handleBreakoutRoomsList);
