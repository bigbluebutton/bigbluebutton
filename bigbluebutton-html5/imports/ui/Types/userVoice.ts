import { User } from './user';

export interface UserVoice {
  callerName: string;
  callerNum: number;
  callingWith: string;
  color: string;
  endTime: number;
  floor: boolean;
  hideTalkingIndicatorAt: number;
  joined: boolean;
  lastFloorTime: number;
  listenOnly: boolean;
  meetingId: string;
  muted: boolean;
  listenOnlyInputDevice: boolean;
  deafened: boolean;
  spoke: boolean;
  startTime: number;
  talking: boolean;
  userId: string;
  voiceConf: string;
  voiceUserId: string;
  user: User;
}
