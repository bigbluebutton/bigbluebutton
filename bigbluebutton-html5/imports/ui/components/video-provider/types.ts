import { VIDEO_TYPES } from './enums';

export type User = {
  userId: string;
  pinned: boolean;
  nameSortable: string;
  name: string;
  away: boolean;
  disconnected: boolean;
  role: string;
  avatar: string;
  color: string;
  presenter: boolean;
  clientType: string;
  raiseHand: boolean;
  isModerator: boolean;
  reactionEmoji: string;
  mobile: boolean;
}

interface GridVoice {
  joined: boolean;
  listenOnly: boolean;
  userId: string;
}

interface Voice extends GridVoice {
  floor: boolean;
  lastFloorTime: string;
}

export interface VideoStreamsResponse {
  user_camera: {
    streamId: string;
    user: User;
    voice?: Voice;
  }[];
}

export interface GridUser extends User {
  voice: GridVoice
}

export interface GridUsersResponse {
  user: GridUser[];
}

export interface OwnVideoStreamsResponse {
  user_camera: {
    streamId: string;
  }[];
}

export type ConnectingStream = {
  userId: string;
  stream: string;
  name: string;
  nameSortable: string;
  type: typeof VIDEO_TYPES.CONNECTING;
};

export type Stream = {
  userId: string;
  stream: string;
  deviceId: string;
  name: string;
  nameSortable: string;
  user: User;
  floor: boolean;
  lastFloorTime: string;
  voice: Voice | undefined;
  type: typeof VIDEO_TYPES.STREAM;
}

export type StreamItem = Stream | ConnectingStream;
export type GridItem = GridUser & { type: typeof VIDEO_TYPES.GRID };
export type VideoItem = StreamItem | GridItem;
