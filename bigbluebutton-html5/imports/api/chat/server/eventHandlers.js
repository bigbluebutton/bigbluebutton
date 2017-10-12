import RedisPubSub from '/imports/startup/server/redis';
import handleChatMessage from './handlers/chatMessage';
import handleChatHistory from './handlers/chatHistory';
import handleChatPublicHistoryClear from './handlers/chatPublicHistoryClear';

RedisPubSub.on('GetChatHistoryRespMsg', handleChatHistory);
RedisPubSub.on('SendPublicMessageEvtMsg', handleChatMessage);
RedisPubSub.on('SendPrivateMessageEvtMsg', handleChatMessage);
RedisPubSub.on('ClearPublicChatHistoryEvtMsg', handleChatPublicHistoryClear);
