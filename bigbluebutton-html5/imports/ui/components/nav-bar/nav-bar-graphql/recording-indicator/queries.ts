/* eslint-disable camelcase */
import { gql } from '@apollo/client';
import { MeetingRecording, MeetingRecordingPolicies } from '/imports/ui/Types/meeting';

export interface getMeetingRecordingPoliciesResponse {
  meeting_recordingPolicies: Array<MeetingRecordingPolicies>;
}

export interface getMeetingRecordingData {
  meeting_recording: Array<MeetingRecording>;
}

export function meetingRecordingAssertion(
  meetingRecording: unknown,
): asserts meetingRecording is MeetingRecording {
  if (!meetingRecording) {
    throw new Error('meetingRecording is undefined');
  }
  if (typeof meetingRecording !== 'object') {
    throw new Error('meetingRecording is not an object');
  }
  if (typeof (meetingRecording as MeetingRecording).isRecording !== 'boolean') {
    throw new Error('meetingRecording.isRecording is not a boolean');
  }
  if (typeof (meetingRecording as MeetingRecording).startedBy !== 'string') {
    throw new Error('meetingRecording.startedBy is not a string');
  }
  if (typeof (meetingRecording as MeetingRecording).previousRecordedTimeInSeconds !== 'number') {
    throw new Error('meetingRecording.previousRecordedTimeInSeconds is not a number');
  }
  if (typeof (meetingRecording as MeetingRecording).startedAt !== 'string') {
    throw new Error('meetingRecording.startedAt is not a Date');
  }
}

export function meetingRecordingPoliciesAssertion(
  meetingRecordingPolicies: unknown,
): asserts meetingRecordingPolicies is MeetingRecordingPolicies {
  if (!meetingRecordingPolicies) {
    throw new Error('meetingRecordingPolicies is undefined');
  }
  if (typeof meetingRecordingPolicies !== 'object') {
    throw new Error('meetingRecordingPolicies is not an object');
  }
  if (
    typeof (meetingRecordingPolicies as MeetingRecordingPolicies).allowStartStopRecording
    !== 'boolean'
  ) {
    throw new Error('meetingRecordingPolicies.allowStartStopRecording is not a boolean');
  }
  if (
    typeof (meetingRecordingPolicies as MeetingRecordingPolicies).autoStartRecording !== 'boolean'
  ) {
    throw new Error('meetingRecordingPolicies.autoStartRecording is not a boolean');
  }
  if (typeof (meetingRecordingPolicies as MeetingRecordingPolicies).record !== 'boolean') {
    throw new Error('meetingRecordingPolicies.record is not a boolean');
  }
}

export const GET_MEETING_RECORDING_POLICIES = gql`
  subscription getMeetingRecordingPolicies {
    meeting_recordingPolicies {
      allowStartStopRecording
      autoStartRecording
      record
    }
  }
`;

export const GET_MEETING_RECORDING_DATA = gql`
  subscription getMeetingRecordingData {
    meeting_recording {
      isRecording
      startedAt
      startedBy
      previousRecordedTimeInSeconds
    }
  }
`;

export default {
  GET_MEETING_RECORDING_POLICIES,
  GET_MEETING_RECORDING_DATA,
};
