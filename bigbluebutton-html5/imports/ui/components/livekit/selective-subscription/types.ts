export enum MediaType {
  AUDIO = 'audio',
  CAMERA = 'camera',
  SCREENSHARE = 'screenshare',
}

/** Reserved group IDs for the explicit public space per media type. */
export const PUBLIC_GROUP_IDS: Record<MediaType, string> = {
  [MediaType.AUDIO]: 'public:audio',
  [MediaType.CAMERA]: 'public:camera',
  [MediaType.SCREENSHARE]: 'public:screenshare',
};

export type MediaGroupParticipant = {
  userId: string;
  groupId: string;
  mediaType: MediaType;
  sender: boolean;
  receiver: boolean;
  active: boolean;
}

export type MediaGroupStateEntry = {
  groupId: string;
  mediaType: string;
  sender: boolean;
  receiver: boolean;
  active: boolean;
}

export type MediaGroupStream = {
  userId: string;
  groupId: string;
  mediaType: MediaType;
  sender: boolean;
  receiver: boolean;
  active: boolean;
};

export type MediaSendersData = {
  senders: MediaGroupStream[];
  inAnyGroup: boolean;
}
