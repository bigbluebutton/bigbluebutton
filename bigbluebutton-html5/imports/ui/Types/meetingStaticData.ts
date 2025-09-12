export interface MeetingStaticData {
  meetingId: string;
  extId: string;
  name: string;
  disabledFeatures: string[];
  isBreakout: boolean;
  endWhenNoModerator: boolean;
  endWhenNoModeratorDelayInMinutes: number;
  createdTime: number;
  maxPinnedCameras: number;
  meetingCameraCap: number;
  cameraBridge: string;
  screenShareBridge: string;
  audioBridge: string;
  loginUrl: string | null;
  logoutUrl: string | null;
  bannerColor: string | null;
  bannerText: string | null;
  customLogoUrl: string | null;
  customDarkLogoUrl: string | null;
  notifyRecordingIsOn: boolean;
  presentationUploadExternalDescription: string;
  presentationUploadExternalUrl: string;
  recordingPolicies: {
    allowStartStopRecording: boolean;
    autoStartRecording: boolean;
    record: boolean;
    keepEvents: boolean;
  } | null;
  usersPolicies: {
    allowModsToEjectCameras: boolean;
    allowModsToUnmuteUsers: boolean;
    authenticatedGuest: boolean;
    guestPolicy: string;
    maxUserConcurrentAccesses: number;
    maxUsers: number;
    meetingLayout: string;
    moderatorsCanMuteAudio: boolean;
    moderatorsCanUnmuteAudio: boolean;
    userCameraCap: number;
    webcamsOnlyForModerator: boolean;
    guestLobbyMessage: string | null;
  };
  breakoutPolicies: {
    breakoutRooms: Array<unknown>;
    captureNotes: boolean;
    captureNotesFilename: string;
    captureSlides: boolean;
    captureSlidesFilename: string;
    freeJoin: boolean;
    parentId: string;
    privateChatEnabled: boolean;
    record: boolean;
    sequence: number;
  };
  voiceSettings: {
    dialNumber: string;
    muteOnStart: boolean;
    voiceConf: string;
    telVoice: string;
  };
}
