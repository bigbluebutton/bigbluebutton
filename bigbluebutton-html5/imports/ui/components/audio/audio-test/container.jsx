import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/service';
import AudioTest from './component';

const AudioTestContainer = props => (
  <AudioTest {...props}>
    {props.children}
  </AudioTest>
);

export default createContainer(() => ({
  outputDeviceId: Service.outputDeviceId(),
  handlePlayAudioSample: (deviceId) => {
    console.log('handle play audio sample', deviceId);
    const sound = new Audio('resources/sounds/audioSample.mp3');
    if (deviceId) sound.setSinkId(deviceId);
    sound.play();
  },
}), AudioTestContainer);
