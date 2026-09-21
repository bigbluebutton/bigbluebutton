import meetingStaticData from '/imports/ui/core/singletons/meetingStaticData';
import { getAudioModes } from '/imports/ui/components/audio/audio-modes';

export interface AudioModeAvailability {
  canUseMicrophone: boolean;
  canListenOnly: boolean;
}

/**
 * The audio modal's rules, read before the join: the bridge comes from
 * meetingStaticData, which is populated by then - the legacy public.media.*
 * configs are not this meeting's.
 */
export const getAudioModeAvailability = (isModerator: boolean): AudioModeAvailability => {
  const usingLiveKit = meetingStaticData.getMeetingData()?.audioBridge === 'livekit';
  const { forceListenOnlyAttendee, listenOnlyMode } = getAudioModes({ isModerator, usingLiveKit });

  return {
    canUseMicrophone: !forceListenOnlyAttendee,
    canListenOnly: listenOnlyMode,
  };
};
