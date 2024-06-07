export type User = {
  userId: string;
  pinned: boolean;
  nameSortable: string;
  name: string;
  away: boolean;
  disconnected: boolean;
  emoji: string;
  role: string;
  avatar: string;
  color: string;
  presenter: boolean;
  clientType: string;
  raiseHand: boolean;
  isModerator: boolean;
  reaction: {
    reactionEmoji: string;
  };
}

export type ConnectingStream = {
  userId: string;
  stream: string;
  name: string;
  nameSortable: string;
  type: 'connecting';
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
  type: 'stream';
}

export type GridUser = User;
export type StreamItem = Stream | ConnectingStream;
export type GridItem = GridUser & { type: 'grid' };
export type VideoItem = StreamItem | GridItem;
