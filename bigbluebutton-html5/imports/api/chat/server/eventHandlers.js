import RedisPubSub from '/imports/startup/server/redis';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';
import handleChatMessage from './handlers/chatMessage';
import handleChatHistory from './handlers/chatHistory';
import handleChatPublicHistoryClear from './handlers/chatPublicHistoryClear';

RedisPubSub.on('GetChatHistoryRespMsg', processForHTML5ServerOnly(handleChatHistory));
RedisPubSub.on('SendPublicMessageEvtMsg', handleChatMessage);
RedisPubSub.on('SendPrivateMessageEvtMsg', processForHTML5ServerOnly(handleChatMessage));
RedisPubSub.on('ClearPublicChatHistoryEvtMsg', handleChatPublicHistoryClear);
