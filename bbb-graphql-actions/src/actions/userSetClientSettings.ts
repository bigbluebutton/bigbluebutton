import { RedisMessage } from '../types';
import {throwErrorIfInvalidInput} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
    throwErrorIfInvalidInput(input,
        [
            {name: 'userClientSettingsJson', type: 'json', required: true},
        ]
    )

    const eventName = `SetUserClientSettingsReqMsg`;

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
        userClientSettingsJson: input.userClientSettingsJson,
    };

    return { eventName, routing, header, body };
}
