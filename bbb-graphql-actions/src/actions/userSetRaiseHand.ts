import { RedisMessage } from '../types';
import {isModerator, throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  const eventName = `ChangeUserRaiseHandReqMsg`;

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
    userId: routing.userId,
    raiseHand: input.raiseHand
  };

  //Moderator can set raiseHand=false for other user
  if(isModerator(sessionVariables) && input.raiseHand !== undefined) {
    body.userId = <String>input.userId;
  }

  return { eventName, routing, header, body };
}
