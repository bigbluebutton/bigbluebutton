import { RedisMessage } from '../types';
import {throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  const eventName = 'SetRecordingStatusCmdMsg';

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
    setBy: routing.userId,
    recording: input.recording
  };

  //TODO check if backend validates it

  // const recordObject = await RecordMeetings.findOneAsync({ meetingId });
  //
  // if (recordObject != null) {
  //   const {
  //     allowStartStopRecording,
  //     recording,
  //     record,
  //   } = recordObject;
  //
  //   meetingRecorded = recording;
  //   allowedToRecord = record && allowStartStopRecording; // TODO-- remove some day
  // }
  //
  // if (allowedToRecord) {}

  return { eventName, routing, header, body };
}
