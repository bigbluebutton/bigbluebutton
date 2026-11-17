import { AxiosResponse } from 'axios';

import { apiCall } from './helpers';

export interface GetMeetingsResponse {
  response: {
    returncode: string[];
    meetings: Array<{
      meeting: Array<{
        meetingName: string[];
        running: string[];
        participantCount: string[];
        moderatorCount: string[];
        isBreakout: string[];
        attendees?: Array<{
          attendee: Array<{
            userID: string[];
            fullName: string[];
            role: string[];
            isPresenter: string[];
          }>;
        }>;
        metadata: string[];
      }>;
    }>;
  };
}

interface GetMeetingInfoResponse {
  response: {
    returncode: string[];
    meetingName: string[];
    internalMeetingID: string[];
    running: string[];
    participantCount: string[];
    moderatorCount: string[];
    isBreakout: string[];
    parentMeetingID?: string[];
    sequence?: string[];
    breakoutRooms?: Array<{
      breakout: string[];
    }>;
    attendees?: Array<{
      attendee: Array<{
        userID: string[];
        fullName: string[];
        role: string[];
        isPresenter: string[];
      }>;
    }>;
    metadata: string[];
  };
}

export function getMeetings(): Promise<AxiosResponse<GetMeetingsResponse>> {
  return apiCall<GetMeetingsResponse>('getMeetings');
}

export function getMeetingInfo(meetingID: string): Promise<AxiosResponse<GetMeetingInfoResponse>> {
  return apiCall<GetMeetingInfoResponse>('getMeetingInfo', { meetingID });
}

export function getRecordings(meetingID: string): Promise<AxiosResponse> {
  return apiCall('getRecordings', { meetingID });
}

interface GetRecordingProcessingInfoResponse {
  response: {
    returncode: string[];
    processing?: string[];
    queuedCount?: string[];
    runningCount?: string[];
    failedCount?: string[];
    oldestQueuedTime?: string[];
    oldestRunningTime?: string[];
    messageKey?: string[];
  };
}

export function getRecordingProcessingInfo(): Promise<AxiosResponse<GetRecordingProcessingInfoResponse>> {
  return apiCall<GetRecordingProcessingInfoResponse>('getRecordingProcessingInfo');
}
