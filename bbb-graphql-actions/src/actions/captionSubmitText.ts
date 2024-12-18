import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";

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

  //TODO validate if (start !== -1 && end !== -1) {

  return { eventName, routing, header, body };
}
