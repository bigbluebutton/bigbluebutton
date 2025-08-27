export interface LockSettings {
  disableCam: boolean;
  disableMic: boolean;
  disableNotes: boolean;
  disablePrivateChat: boolean;
  disablePublicChat: boolean;
  hasActiveLockSetting: boolean;
  hideUserList: boolean;
  hideViewersCursor: boolean;
  hideViewersAnnotation: false,
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
  welcomeMsgForModerators: string;
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
  allowPromoteGuestToModerator: boolean;
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
  parentId: string;
  privateChatEnabled: boolean;
  record: boolean;
  sequence: number;
}

export interface BreakoutRoomsCommonProperties {
  durationInSeconds: number;
  freeJoin: boolean;
  sendInvitationToModerators: boolean;
  startedAt: Date;
}

export interface ExternalVideo {
  externalVideoId: string;
  playerCurrentTime: number;
  playerPlaybackRate: number;
  playerPlaying: boolean;
  externalVideoUrl: string;
  startedSharingAt: number;
  stoppedSharingAt: number;
  updatedAt: string;
}

export interface Layout {
  currentLayoutType: string;
}

export interface ComponentsFlags {
  hasCaption: boolean;
  hasBreakoutRoom: boolean;
  hasExternalVideo: boolean;
  hasPoll: boolean;
  hasScreenshare: boolean;
  hasTimer: boolean;
  showRemainingTime: boolean;
  hasCameraAsContent: boolean;
  hasScreenshareAsContent: boolean;
  hasCurrentPresentation: boolean;
  hasSharedNotes: boolean;
  isSharedNotesPinned: boolean;
}

export interface Meeting {
  createdTime: number;
  disabledFeatures: Array<string>;
  durationInSeconds: number;
  extId: string;
  isBreakout: boolean;
  learningDashboardAccessToken: string;
  maxPinnedCameras: number;
  meetingCameraCap: number;
  cameraBridge: string;
  screenShareBridge: string;
  audioBridge: string;
  meetingId: string;
  name: string;
  notifyRecordingIsOn: boolean;
  presentationUploadExternalDescription: string;
  presentationUploadExternalUrl: string;
  usersPolicies: UsersPolicies;
  lockSettings: LockSettings;
  voiceSettings: VoiceSettings;
  breakoutPolicies: BreakoutPolicies;
  breakoutRoomsCommonProperties: BreakoutRoomsCommonProperties;
  externalVideo: ExternalVideo;
  layout: Layout;
  componentsFlags: ComponentsFlags;
  endWhenNoModerator: boolean;
  endWhenNoModeratorDelayInMinutes: number;
  loginUrl: string | null;
  groups: Array<groups>;
}
