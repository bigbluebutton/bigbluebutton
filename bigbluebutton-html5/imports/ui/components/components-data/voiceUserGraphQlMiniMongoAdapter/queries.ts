import { gql } from '@apollo/client';

interface UserVoiceStream {
  callerName: string | null;
  callerNum: string | null;
  callingWith: string | null;
  endTime: string | null;
  endedAt: string | null;
  floor: string | null;
  hideTalkingIndicatorAt: string | null;
  joined: string | null;
  lastFloorTime: string | null;
  lastSpeakChangedAt: number;
  listenOnly: string | null;
  muted: string | null;
  showTalkingIndicator: boolean;
  spoke: string | null;
  startTime: string | null;
  startedAt: string | null;
  talking: string | null;
  userId: string;
  voiceConf: string | null;
  voiceConfCallSession: string | null;
  voiceConfCallState: string | null;
  voiceConfClientSession: string | null;
  voiceUpdatedAt: string | null;
  voiceUserId: string | null;
}

export interface UserVoiceStreamResponse {
  user_voice_mongodb_adapter_stream: UserVoiceStream[];
}

export const voiceUserStream = gql`
  subscription voiceUserStream {
    user_voice_mongodb_adapter_stream(cursor: {initial_value: {voiceUpdatedAt: "2020-01-01"}}, batch_size: 100) {
      callerName
      callerNum
      callingWith
      endTime
      endedAt
      floor
      hideTalkingIndicatorAt
      joined
      lastFloorTime
      lastSpeakChangedAt
      listenOnly
      muted
      showTalkingIndicator
      spoke
      startTime
      startedAt
      talking
      userId
      voiceConf
      voiceConfCallSession
      voiceConfCallState
      voiceConfClientSession
      voiceUpdatedAt
      voiceUserId
    }
  }
`;

export default {
  voiceUserStream,
};
