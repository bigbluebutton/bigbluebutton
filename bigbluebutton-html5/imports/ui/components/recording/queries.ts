export interface GetRecordingResponse {
  meeting_recording: {
    isRecording: boolean;
    previousRecordedTimeInSeconds: number;
  }[]
}

export interface GetRecordingPoliciesResponse {
  meeting_recordingPolicies: {
    allowStartStopRecording: boolean;
  }[]
}
