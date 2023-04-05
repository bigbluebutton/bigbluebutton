export interface Cameras {
  streamId: string;
  meetingId: string;
  userId: string;  
}

export interface BreakoutRoom {
    breakoutRoomId: string;
    isDefaultName: boolean;
    sequence: number;
    shortName: string;
    online: boolean;
    meetingId: string;
    userId: string;
}

export interface Microphones {
  joined: boolean;
  listenOnly: boolean;
  talking: boolean;
  muted: boolean;
  voiceUserId: string;
}

export interface User {
    userId: string;
    name: string;
    role: string;
    color: string;
    avatar: string;
    emoji: string;
    presenter?: boolean;
    pinned?: boolean;
    guest?: boolean;
    mobile?: boolean;
    whiteboardAccess?: boolean;
    microphones: Array<Microphones>;
    breakoutRoom?: BreakoutRoom;
    cameras: Array<Cameras>;  
}