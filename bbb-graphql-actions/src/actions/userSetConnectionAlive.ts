import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
      [
        {name: 'clientSessionUUID', type: 'string', required: true},
        {name: 'networkRttInMs', type: 'number', required: true},
        {name: 'applicationRttInMs', type: 'number', required: false},
        {name: 'traceLog', type: 'string', required: false},
      ]
  )

  const eventName = `UserConnectionAliveReqMsg`;

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as String,
    userId: sessionVariables['x-hasura-userid'] as String
  };

  const sessionToken = sessionVariables['x-hasura-sessiontoken'] as String;

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  let traceLog = '';
  if('traceLog' in input && input.traceLog != null && input.traceLog != '') {
    console.info(`Received ${input.traceLog} meetingId=${routing.meetingId} userId=${routing.userId}`);
    traceLog = input.traceLog + '@gqlactions|' + new Date().toISOString();
  }

  const body = {
    userId: routing.userId,
    sessionToken: sessionToken,
    clientSessionUUID: input.clientSessionUUID,
    networkRttInMs: input.networkRttInMs,
    applicationRttInMs: input.applicationRttInMs ?? 0,
    traceLog
  };



  return { eventName, routing, header, body };
}
