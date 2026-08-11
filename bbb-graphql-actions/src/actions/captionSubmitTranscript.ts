
import {
  throwErrorIfInvalidInput,
  throwErrorIfInvalidLocale,
  throwErrorIfNotModerator,
  throwErrorIfStringTooLong,
} from '../imports/validation';
import { RedisMessage } from '../types';

const MAX_TRANSCRIPT_LENGTH = 8192;
const MAX_TRANSCRIPT_ID_LENGTH = 40;

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);

  const eventName = `CaptionSubmitTranscriptPubMsg`;

  throwErrorIfInvalidInput(input,
    [
      {name: 'transcriptId', type: 'string', required: true},
      {name: 'transcript', type: 'string', required: true},
      {name: 'locale', type: 'string', required: true},
      {name: 'captionType', type: 'string', required: true},
    ]
)

  throwErrorIfInvalidLocale(input.locale);
  throwErrorIfStringTooLong('transcriptId', input.transcriptId, MAX_TRANSCRIPT_ID_LENGTH);
  throwErrorIfStringTooLong('transcript', input.transcript, MAX_TRANSCRIPT_LENGTH);

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
