import RedisPubSub from '/imports/startup/server/redis';
import handleBreakoutRoomsList from './handlers/breakoutRoomsList';
import messageToAllSent from '/imports/api/breakouts-history/server/handlers/messageToAllSent';

RedisPubSub.on('BreakoutRoomsListEvtMsg', handleBreakoutRoomsList);
RedisPubSub.on('SendMessageToAllBreakoutRoomsEvtMsg', messageToAllSent);
