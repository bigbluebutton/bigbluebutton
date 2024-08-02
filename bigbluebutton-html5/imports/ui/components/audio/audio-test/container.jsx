import React, { useCallback } from 'react';
import { useReactiveVar } from '@apollo/client';
import AudioManager from '/imports/ui/services/audio-manager';
import AudioTest from './component';

const AudioTestContainer = (props) => {
  const outputDeviceId = useReactiveVar(AudioManager._outputDeviceId.value);
  const handlePlayAudioSample = useCallback((deviceId) => {
    const sound = new Audio(`${window.meetingClientSettings.public.app.cdn + window.meetingClientSettings.public.app.basename}/resources/sounds/audioSample.mp3`);
    sound.addEventListener('ended', () => { sound.src = null; });
    if (deviceId && sound.setSinkId) sound.setSinkId(deviceId);
    sound.play();
  }, []);
  return (
    <AudioTest
      outputDeviceId={outputDeviceId}
      handlePlayAudioSample={handlePlayAudioSample}
      {...props}
    />
  );
};

export default AudioTestContainer;
