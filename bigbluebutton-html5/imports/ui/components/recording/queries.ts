export interface GetRecordingResponse {
  meeting_recording: {
    isRecording: boolean;
    previousRecordedTimeInSeconds: number;
  }[]
}
