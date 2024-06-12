import React from 'react';
import { useReactiveVar } from '@apollo/client';
import { withTracker } from 'meteor/react-meteor-data';
import AudioManager from '/imports/ui/services/audio-manager';
import AudioTest from './component';

const AudioTestContainer = (props) => {
  const outputDeviceId = useReactiveVar(AudioManager._outputDeviceId.value);
  return (
    <AudioTest
      outputDeviceId={outputDeviceId}
      {...props}
    />
  );
};

export default withTracker(() => ({
  handlePlayAudioSample: (deviceId) => {
    const sound = new Audio(`${window.meetingClientSettings.public.app.cdn + window.meetingClientSettings.public.app.basename + window.meetingClientSettings.public.app.instanceId}/resources/sounds/audioSample.mp3`);
    sound.addEventListener('ended', () => { sound.src = null; });
    if (deviceId && sound.setSinkId) sound.setSinkId(deviceId);
    sound.play();
  },
}))(AudioTestContainer);
