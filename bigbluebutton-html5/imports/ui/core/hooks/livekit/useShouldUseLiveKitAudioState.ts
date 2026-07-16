import { useMemo } from 'react';
import useMeeting from '../useMeeting';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';

const useShouldUseLiveKitAudioState = () => {
  const { data: meeting } = useMeeting((m) => ({
    audioBridge: m.audioBridge,
  }));
  const [meetingSettings] = useMeetingSettings();
  const isLiveKitAudioBridge = meeting?.audioBridge === 'livekit';
  const useLiveKitAudioState = meetingSettings.public.media?.livekit?.audio?.useLiveKitAudioState ?? false;

  return useMemo(() => useLiveKitAudioState && isLiveKitAudioBridge, [
    useLiveKitAudioState,
    isLiveKitAudioBridge,
  ]);
};

export default useShouldUseLiveKitAudioState;
