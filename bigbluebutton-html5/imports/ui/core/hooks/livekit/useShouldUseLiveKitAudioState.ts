import { useMemo } from 'react';
import { useReactiveVar } from '@apollo/client';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';
import AudioManager from '/imports/ui/services/audio-manager';

const useShouldUseLiveKitAudioState = () => {
  const [meetingSettings] = useMeetingSettings();
  // @ts-ignore - AudioManager is untyped
  // eslint-disable-next-line no-underscore-dangle
  const isUsingLiveKit = useReactiveVar(AudioManager._isUsingLiveKit.value) as boolean;
  const useLiveKitAudioState = meetingSettings.public.media?.livekit?.audio?.useLiveKitAudioState ?? false;

  return useMemo(() => useLiveKitAudioState && isUsingLiveKit, [useLiveKitAudioState, isUsingLiveKit]);
};

export default useShouldUseLiveKitAudioState;
