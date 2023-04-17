export interface Cameras {
  streamId: string;
  meetingId: string;
  userId: string;  
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

export interface User {
    userId: string;
    extId: string;
    name: string;
    isModerator: boolean;
    role: string;
    color: string;
    avatar: string;
    emoji: string;
    presenter?: boolean;
    pinned?: boolean;
    guest?: boolean;
    mobile?: boolean;
    whiteboardAccess?: boolean;
    voice?: Voice;
    locked: boolean;
    lastBreakoutRoom?: LastBreakoutRoom;
    cameras: Array<Cameras>;
    presPagesWritable: Array<PresPagesWritable>;
}