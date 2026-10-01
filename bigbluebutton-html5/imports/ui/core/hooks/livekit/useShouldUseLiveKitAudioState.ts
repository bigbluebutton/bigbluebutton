import { useMemo } from 'react';
import useMeeting from '../useMeeting';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';

export const useIsUsingLiveKitAudio = (): boolean => {
  const { data: meeting } = useMeeting((m) => ({
    audioBridge: m.audioBridge,
  }));

  return meeting?.audioBridge === 'livekit';
};

const useShouldUseLiveKitAudioState = () => {
  const [meetingSettings] = useMeetingSettings();
  const isLiveKitAudioBridge = useIsUsingLiveKitAudio();
  const useLiveKitAudioState = meetingSettings.public.media?.livekit?.audio?.useLiveKitAudioState ?? false;

  return useMemo(() => useLiveKitAudioState && isLiveKitAudioBridge, [
    useLiveKitAudioState,
    isLiveKitAudioBridge,
  ]);
};

export default useShouldUseLiveKitAudioState;
