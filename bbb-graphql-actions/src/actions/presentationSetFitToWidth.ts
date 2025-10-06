import { RedisMessage } from '../types';
import { throwErrorIfNotPresenter, throwErrorIfInvalidInput } from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  throwErrorIfInvalidInput(input, [
    {name: 'pageId', type: 'string', required: true},
    { name: 'fitToWidth', type: 'boolean', required: true },
  ]);

  const eventName = `SetPresentationFitToWidthCmdMsg`;

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as string,
    userId: sessionVariables['x-hasura-userid'] as string,
  };

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId,
  };

  const body = {
    userId: routing.userId,
    pageId: input.pageId,
    fitToWidth: input.fitToWidth,
  };

  return { eventName, routing, header, body };
}