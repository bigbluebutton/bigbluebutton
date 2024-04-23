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
  lastSpeakChangedAt: number;
  meetingId: string;
  spoke: boolean;
  startTime: number;
}

export interface CustomParameter {
  parameter: string;
  value: string;
}

export interface Reaction {
  reactionEmoji: string;
}

export interface BreakoutRooms {
  currentRoomJoined: boolean;
  assignedAt: string;
  breakoutRoomId: string;
  currentRoomIsOnline: boolean | null;
  currentRoomPriority: number;
  currentRoomRegisteredAt: string | null;
  durationInSeconds: number;
  endedAt: string | null;
  freeJoin: boolean;
  inviteDismissedAt: string | null;
  isDefaultName: boolean;
  joinURL: string;
  lastRoomIsOnline: boolean;
  lastRoomJoinedAt: string;
  lastRoomJoinedId: string;
  name: string;
  sendInvitationToModerators: boolean;
  sequence: number;
  shortName: string;
  showInvitation: boolean;
  startedAt: string;
}
export interface UserClientSettings {
  userClientSettingsJson: string;
}

export interface User {
  authToken: string;
  userId: string;
  extId: string;
  name: string;
  nameSortable: string;
  banned: boolean;
  isModerator: boolean;
  clientType: string;
  disconnected: boolean;
  isOnline: boolean;
  isRunningEchoTest: boolean;
  echoTestRunningAt: number;
  ejectReason: string;
  ejectReasonCode: string;
  ejected: boolean;
  enforceLayout: boolean;
  role: string;
  color: string;
  avatar: string;
  emoji: string;
  presenter?: boolean;
  pinned?: boolean;
  guest?: boolean;
  guestStatus: string;
  joinErrorCode: string;
  joinErrorMessage: string;
  joined: boolean;
  loggedOut: boolean;
  mobile?: boolean;
  whiteboardAccess?: boolean;
  isDialIn: boolean;
  voice?: Partial<Voice>;
  locked: boolean;
  registeredAt: string;
  registeredOn: number;
  hasDrawPermissionOnCurrentPage: boolean;
  lastBreakoutRoom?: LastBreakoutRoom;
  cameras: Array<Cameras>;
  presPagesWritable: Array<PresPagesWritable>;
  speechLocale: string;
  authed: boolean;
  size: number;
  away: boolean;
  raiseHand: boolean;
  reaction: Reaction;
  breakoutRooms: BreakoutRooms;
  customParameters: Array<CustomParameter>;
  userClientSettings: UserClientSettings;
}
