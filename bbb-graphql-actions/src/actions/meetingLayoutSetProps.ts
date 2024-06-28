import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput, throwErrorIfNotPresenter} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  throwErrorIfInvalidInput(input,
      [
        {name: 'layout', type: 'string', required: true},
        {name: 'syncWithPresenterLayout', type: 'boolean', required: true},
        {name: 'presentationIsOpen', type: 'boolean', required: true},
        {name: 'isResizing', type: 'boolean', required: true},
        {name: 'cameraPosition', type: 'string', required: false},
        {name: 'focusedCamera', type: 'string', required: true},
        {name: 'presentationVideoRate', type: 'number', required: true},
      ]
  )

  const eventName = 'BroadcastLayoutMsg';

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
    layout: input.layout,
    pushLayout: input.syncWithPresenterLayout,
    presentationIsOpen: input.presentationIsOpen,
    isResizing: input.isResizing,
    cameraPosition: input.cameraPosition || "",
    focusedCamera: input.focusedCamera,
    presentationVideoRate: input.presentationVideoRate
  };

  return { eventName, routing, header, body };
}
