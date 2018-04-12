import RedisPubSub from '/imports/startup/server/redis';
import { skipFlashDirectEvent } from '/imports/api/common/server/helpers';
import handleChatMessage from './handlers/chatMessage';
import handleChatHistory from './handlers/chatHistory';
import handleChatPublicHistoryClear from './handlers/chatPublicHistoryClear';

RedisPubSub.on('GetChatHistoryRespMsg', skipFlashDirectEvent(handleChatHistory));
RedisPubSub.on('SendPublicMessageEvtMsg', handleChatMessage);
RedisPubSub.on('SendPrivateMessageEvtMsg', skipFlashDirectEvent(handleChatMessage));
RedisPubSub.on('ClearPublicChatHistoryEvtMsg', handleChatPublicHistoryClear);
