import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/service';
import AudioTest from './component';

const AudioTestContainer = props => <AudioTest {...props} />;

export default withTracker(() => ({
  outputDeviceId: Service.outputDeviceId(),
  handlePlayAudioSample: (deviceId) => {
    const sound = new Audio('resources/sounds/audioSample.mp3');
    if (deviceId && sound.setSinkId) sound.setSinkId(deviceId);
    sound.play();
  },
}))(AudioTestContainer);
