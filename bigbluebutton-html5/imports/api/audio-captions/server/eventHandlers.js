import RedisPubSub from '/imports/startup/server/redis';
import handleTranscriptUpdated from '/imports/api/audio-captions/server/handlers/transcriptUpdated';

RedisPubSub.on('TranscriptUpdatedEvtMsg', handleTranscriptUpdated);
