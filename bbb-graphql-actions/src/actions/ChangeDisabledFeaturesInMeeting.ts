import { RedisMessage } from "../types";
import {
  throwErrorIfInvalidInput,
  throwErrorIfNotModerator,
} from "../imports/validation";
import { ValidationError } from "../types/ValidationError";

export default function buildRedisMessage(
  sessionVariables: Record<string, unknown>,
  input: Record<string, unknown>,
): RedisMessage {
  // Ensure only moderators can call this mutation
  throwErrorIfNotModerator(sessionVariables);

  const eventName = "ChangeDisabledFeaturesInMeetingCmdMsg";

  // Validate input
  throwErrorIfInvalidInput(input, [
    { name: "disabledFeatures", type: "stringArray", required: true },
  ]);

  const disabledFeatures = input["disabledFeatures"] as string[];

  const routing = {
    meetingId: sessionVariables["x-hasura-meetingid"] as string,
    userId: sessionVariables["x-hasura-userid"] as string,
  };

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId,
  };

  const body = {
    disabledFeatures,
  };

  return { eventName, routing, header, body };
}
