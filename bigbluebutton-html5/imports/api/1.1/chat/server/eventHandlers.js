import RedisPubSub from '/imports/startup/server/redis';
import handleChatMessage from './handlers/chatMessage';
import handleChatHistory from './handlers/chatHistory';

RedisPubSub.on('get_chat_history_reply', handleChatHistory);
RedisPubSub.on('send_public_chat_message', handleChatMessage);
RedisPubSub.on('send_private_chat_message', handleChatMessage);
