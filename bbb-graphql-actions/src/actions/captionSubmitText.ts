import { RedisMessage } from '../types';
import {
  throwErrorIfInvalidInput,
  throwErrorIfInvalidLocale,
  throwErrorIfIntOutOfRange,
  throwErrorIfStringTooLong,
} from "../imports/validation";
import { MAX_TRANSCRIPT_ID_LENGTH, MAX_TRANSCRIPT_LENGTH } from "../imports/captionLimits";
import { ValidationError } from "../types/ValidationError";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'transcriptId', type: 'string', required: true},
        {name: 'start', type: 'int', required: true},
        {name: 'end', type: 'int', required: true},
        {name: 'text', type: 'string', required: true},
        {name: 'transcript', type: 'string', required: true},
        {name: 'locale', type: 'string', required: true},
        {name: 'isFinal', type: 'boolean', required: true},
      ]
  )

  throwErrorIfInvalidLocale(input.locale);
  throwErrorIfStringTooLong('transcriptId', input.transcriptId, MAX_TRANSCRIPT_ID_LENGTH);
  throwErrorIfStringTooLong('text', input.text, MAX_TRANSCRIPT_LENGTH);
  throwErrorIfStringTooLong('transcript', input.transcript, MAX_TRANSCRIPT_LENGTH);
  // An offset can never legitimately exceed the maximum text length, and
  // akka-apps clamps both to the real transcript length anyway.
  throwErrorIfIntOutOfRange('start', input.start, 0, MAX_TRANSCRIPT_LENGTH);
  throwErrorIfIntOutOfRange('end', input.end, 0, MAX_TRANSCRIPT_LENGTH);

  if ((input.start as number) > (input.end as number)) {
    throw new ValidationError('Parameter `start` must not be greater than `end`', 400);
  }

  const eventName = `UpdateTranscriptPubMsg`;

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
    start: input.start,
    end: input.end,
    text: input.text,
    transcript: input.transcript,
    locale: input.locale,
    result: input.isFinal,
  };

  return { eventName, routing, header, body };
}
