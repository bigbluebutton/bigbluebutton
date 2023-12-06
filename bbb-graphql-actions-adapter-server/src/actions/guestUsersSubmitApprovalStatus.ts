import { RedisMessage } from '../types';
import {throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  const eventName = 'GuestsWaitingApprovedMsg';

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
    approvedBy: routing.userId,
    guests: input.guests
  };
  // guestUsersSubmitApprovalStatus
  //guest = {guest: "userId", status: "ALLOW"}
  //guest = {guest: "userId", status: "DENY"}

  return { eventName, routing, header, body };
}
