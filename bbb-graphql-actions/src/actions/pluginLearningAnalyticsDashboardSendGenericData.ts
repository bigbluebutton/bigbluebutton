import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfInvalidInput(input,
    [
      {name: 'pluginName', type: 'string', required: true},
      {name: 'genericDataForLearningAnalyticsDashboard', type: 'json', required: true},
    ]
  )


  const genericDataForLearningAnalyticsDashboard = input[
    'genericDataForLearningAnalyticsDashboard'
  ] as Record<string, unknown>;
  if(genericDataForLearningAnalyticsDashboard) {
    throwErrorIfInvalidInput(genericDataForLearningAnalyticsDashboard,
        [
          {name: 'cardTitle', type: 'string', required: true},
          {name: 'columnTitle', type: 'string', required: true},
          {name: 'value', type: 'string', required: true},
        ]
    )
  }

  const eventName = `PluginLearningAnalyticsDashboardSendGenericDataMsg`;

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
    pluginName: input.pluginName,
    genericDataForLearningAnalyticsDashboard: input.genericDataForLearningAnalyticsDashboard,
  };

  return { eventName, routing, header, body };
}
