import RedisPubSub from '/imports/startup/server/redis';
import handleTranscriptUpdated from '/imports/api/audio-captions/server/handlers/transcriptUpdated';
import handleTranscriptionProviderError from '/imports/api/audio-captions/server/handlers/transcriptionProviderError';

RedisPubSub.on('TranscriptUpdatedEvtMsg', handleTranscriptUpdated);
RedisPubSub.on('TranscriptionProviderErrorEvtMsg', handleTranscriptionProviderError);
