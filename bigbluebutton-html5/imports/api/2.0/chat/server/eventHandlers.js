import RedisPubSub from '/imports/startup/server/redis2x';
import handleChatMessage from './handlers/chatMessage';
import handleChatHistory from './handlers/chatHistory';

RedisPubSub.on('GetChatHistoryRespMsg', handleChatHistory);
RedisPubSub.on('SendPublicMessageEvtMsg', handleChatMessage);
RedisPubSub.on('SendPrivateMessageEvtMsg', handleChatMessage);
