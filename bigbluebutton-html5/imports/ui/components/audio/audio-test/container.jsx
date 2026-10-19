import React, { useCallback } from 'react';
import { useReactiveVar } from '@apollo/client';
import AudioManager from '/imports/ui/services/audio-manager';
import AudioTest from './component';
import { assetUrl } from '/imports/ui/services/url-builder';

const AudioTestContainer = (props) => {
  const outputDeviceId = useReactiveVar(AudioManager._outputDeviceId.value);
  const handlePlayAudioSample = useCallback((deviceId) => {
    const sound = new Audio(assetUrl('resources/sounds/audioSample.mp3'));
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
