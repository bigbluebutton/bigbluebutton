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
  lockOnJoin: boolean;
  lockOnJoinConfigurable: boolean;
}

export interface groups {
  groupId: string;
  name: string;
}

export interface WelcomeSettings {
  welcomeMsg: string;
  modOnlyMessage: string;
  welcomeMsgTemplate: string;
  meetingId: string;
}

export interface MeetingRecording {
  isRecording: boolean;
  startedAt: Date;
  previousRecordedTimeInSeconds: number;
  startedBy: string;
  stoppedAt: number;
  stoppedBy: string;
}
export interface MeetingRecordingPolicies {
  allowStartStopRecording: boolean;
  autoStartRecording: boolean;
  record: boolean;
  keepEvents: boolean;
  startedAt: number;
  startedBy: string;
  stoppedAt: number;
  stoppedBy: string;
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
  guestLobbyMessage: string | null;
}

export interface VoiceSettings {
  dialNumber: string;
  meetingId: string;
  muteOnStart: boolean;
  telVoice: string;
  voiceConf: string;
}

export interface BreakoutPolicies {
  breakoutRooms: Array<unknown>;
  captureNotes: string;
  captureNotesFilename: string;
  captureSlides: string;
  captureSlidesFilename: string;
  freeJoin: boolean;
  meetingId: string;
  parentId: string;
  privateChatEnabled: boolean;
  record: boolean;
  sequence: number;
}

export interface ExternalVideo {
  externalVideoId: string;
  playerCurrentTime: number;
  playerPlaybackRate: number;
  playerPlaying: boolean;
  externalVideoUrl: string;
  startedSharingAt: number;
  stoppedSharingAt: number;
  updatedAt: Date;
}

export interface ComponentsFlags {
  hasCaption: boolean;
  hasBreakoutRoom: boolean;
  hasExternalVideo: boolean;
  hasPoll: boolean;
  hasScreenshare: boolean;
  hasTimer: boolean;
  showRemainingTime: boolean;
}

export interface Metadata {
  name: string;
  value: string;
}

export interface Meeting {
  createdTime: number;
  disabledFeatures: Array<string>;
  durationInSeconds: number;
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
  voiceSettings: VoiceSettings;
  breakoutPolicies: BreakoutPolicies;
  externalVideo: ExternalVideo;
  componentsFlags: ComponentsFlags;
  endWhenNoModerator: boolean;
  endWhenNoModeratorDelayInMinutes: number;
  loginUrl: string | null;
  metadata: Array<Metadata>;
  groups: Array<groups>;
}
