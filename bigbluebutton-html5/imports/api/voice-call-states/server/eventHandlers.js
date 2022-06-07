import RedisPubSub from '/imports/startup/server/redis';
import handleVoiceCallStateEvent from './handlers/voiceCallStateEvent';

RedisPubSub.on('VoiceCallStateEvtMsg', handleVoiceCallStateEvent);
