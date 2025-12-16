import { RedisMessage } from '../types';
import { throwErrorIfInvalidInput } from "../imports/validation";

export default function buildRedisMessage(
  sessionVariables: Record<string, unknown>,
  input: Record<string, unknown>
): RedisMessage {
  throwErrorIfInvalidInput(input, [
    { name: 'requestedPresenter', type: 'boolean', required: true },
    { name: 'userId', type: 'string', required: false },
    { name: 'approved', type: 'boolean', required: false },
  ]);

  const eventName = 'UserSetPresenterRequestReqMsg';
  const currentUserId = sessionVariables['x-hasura-userid'] as string;
  const meetingId = sessionVariables['x-hasura-meetingid'] as string;

  const routing = {
    meetingId,
    userId: currentUserId,
  };

  const header = {
    name: eventName,
    meetingId,
    userId: currentUserId,
  };

  const body = {
    requesterId: (input.userId as string) || currentUserId,
    requestedPresenter: input.requestedPresenter as boolean,
    approved: (input.approved as boolean) ?? false,
  };

  return { eventName, routing, header, body };
}