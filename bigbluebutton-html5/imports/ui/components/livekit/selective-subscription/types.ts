export enum MediaType {
  AUDIO = 'audio',
  CAMERA= 'camera',
  SCREENSHARE = 'screenshare',
}

export type MediaGroupParticipant = {
  userId: string;
  groupId: string;
  mediaType: MediaType;
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

export const SUBSCRIPTION_RETRY = {
  MAX_RETRIES: 3,
  RETRY_INTERVAL: 2000,
  BACKOFF_MULTIPLIER: 1.5,
};
