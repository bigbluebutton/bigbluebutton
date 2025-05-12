export enum ParticipantTypes {
  SENDER = 'SENDONLY',
  RECEIVER = 'RECVONLY',
  SENDRECV = 'SENDRECV',
}
export type AudioGroupParticipantType = ParticipantTypes.SENDER | ParticipantTypes.RECEIVER | ParticipantTypes.SENDRECV;

export type AudioGroupParticipant = {
  userId: string;
  groupId: string;
  participantType: AudioGroupParticipantType;
  active: boolean;
}

export type AudioGroupStream = {
  userId: string;
  groupId: string;
  participantType: AudioGroupParticipantType;
  active: boolean;
};

export type AudioSendersData = {
  senders: AudioGroupStream[];
  inAnyGroup: boolean;
}

export const SUBSCRIPTION_RETRY = {
  MAX_RETRIES: 3,
  RETRY_INTERVAL: 2000,
  BACKOFF_MULTIPLIER: 1.5,
};
