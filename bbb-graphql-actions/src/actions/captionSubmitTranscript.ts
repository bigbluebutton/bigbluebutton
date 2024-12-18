
import { throwErrorIfInvalidInput } from '../imports/validation';
import { RedisMessage } from '../types';

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  const eventName = `CaptionSubmitTranscriptPubMsg`;

  throwErrorIfInvalidInput(input,
    [
      {name: 'transcriptId', type: 'string', required: true},
      {name: 'transcript', type: 'string', required: true},
      {name: 'locale', type: 'string', required: true},
      {name: 'captionType', type: 'string', required: true},
    ]
)

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as String,
    userId: sessionVariables['x-hasura-userid'] as String
  };

  const header = { 
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  const body = {
    transcriptId: input.transcriptId,
    transcript: input.transcript,
    locale: input.locale,
    captionType: input.captionType,
  };

  return { eventName, routing, header, body };
}
