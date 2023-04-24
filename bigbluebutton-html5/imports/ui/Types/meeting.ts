export interface LockSettings {  
  disableCam: boolean;
  disableMic: boolean;
  disableNotes: boolean;
  disablePrivateChat: boolean;
  disablePublicChat: boolean;
  hasActiveLockSetting: boolean;
  hideUserList: boolean;
  hideViewersCursor: boolean;
  meetingId: boolean;
  webcamsOnlyForModerator: boolean;
}

export interface UsersPolicies {
  allowModsToEjectCameras: boolean;
  allowModsToUnmuteUsers: boolean;
  authenticatedGuest: boolean;
  guestPolicy: string;
  maxUserConcurrentAccesses: number;
  maxUsers: number;
  meetingId: string;
  meetingLayout: string;
  userCameraCap: number;
  webcamsOnlyForModerator: boolean;
}

export interface Meeting {
  createdTime: number;
  disabledFeatures: Array<string>;
  duration: number;
  extId: string;
  html5InstanceId: string | null;
  isBreakout: boolean;
  learningDashboardAccessToken: string;
  maxPinnedCameras: number;
  meetingCameraCap: number;
  meetingId: string;
  name: string;
  notifyRecordingIsOn: boolean;
  presentationUploadExternalDescription: string;
  presentationUploadExternalUrl: string;
  usersPolicies: UsersPolicies;
  lockSettings: LockSettings;
}