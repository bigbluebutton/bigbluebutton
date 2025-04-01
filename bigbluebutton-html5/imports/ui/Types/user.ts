export interface Cameras {
  streamId: string;
}

export interface PresPagesWritable {
  isCurrentPage: boolean;
  changedModeOn: number;
  meetingId: string;
  pageId: string;
  presentationId: string;
  userId: string;
}

export interface LastBreakoutRoom {
    breakoutRoomId: string;
    isDefaultName: boolean;
    sequence: number;
    shortName: string;
    currentlyInRoom: boolean;
    meetingId: string;
    userId: string;
}

export interface Voice {
  joined: boolean;
  listenOnly: boolean;
  talking: boolean;
  muted: boolean;
  voiceUserId: string;
  callerName: string;
  callerNum: string;
  callingWith: string;
  color: string;
  endTime: number;
  floor: boolean;
  lastFloorTime: string
  meetingId: string;
  spoke: boolean;
  startTime: number;
}

export interface UserMetadata {
  parameter: string;
  value: string;
}

export interface BreakoutRooms {
  hasJoined: boolean;
  assignedAt: string;
  breakoutRoomId: string;
  isUserCurrentlyInRoom: boolean | null;
  isLastAssignedRoom: boolean | null;
  durationInSeconds: number;
  endedAt: string | null;
  freeJoin: boolean;
  inviteDismissedAt: string | null;
  isDefaultName: boolean;
  joinURL: string;
  name: string;
  sendInvitationToModerators: boolean;
  sequence: number;
  shortName: string;
  showInvitation: boolean;
  startedAt: string;
}

export interface userLockSettings {
  disablePublicChat: boolean;
}

export interface sessionCurrent {
  enforceLayout: boolean;
}

export interface Livekit {
  livekitToken: string;
}

export interface User {
  authToken: string;
  userId: string;
  extId: string;
  name: string;
  nameSortable: string;
  isModerator: boolean;
  clientType: string;
  disconnected: boolean;
  currentlyInMeeting: boolean;
  ejectReason: string;
  ejectReasonCode: string;
  ejected: boolean;
  role: string;
  color: string;
  avatar: string;
  webcamBackground: string;
  reactionEmoji: string;
  presenter?: boolean;
  pinned?: boolean;
  bot?: boolean;
  guest?: boolean;
  guestStatus: string;
  joinErrorCode: string;
  joinErrorMessage: string;
  inactivityWarningDisplay: boolean;
  joined: boolean;
  loggedOut: boolean;
  mobile?: boolean;
  whiteboardAccess?: boolean;
  isDialIn: boolean;
  voice?: Partial<Voice>;
  locked: boolean;
  registeredAt: string;
  hasDrawPermissionOnCurrentPage: boolean;
  lastBreakoutRoom?: LastBreakoutRoom;
  cameras: Array<Cameras>;
  presPagesWritable: Array<PresPagesWritable>;
  speechLocale: string;
  captionLocale: string;
  authed: boolean;
  size: number;
  away: boolean;
  raiseHand: boolean;
  breakoutRooms: BreakoutRooms;
  userLockSettings: userLockSettings;
  sessionCurrent: sessionCurrent;
  livekit?: Livekit;
}
