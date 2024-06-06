import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/service';
import AudioTest from './component';

const AudioTestContainer = (props) => <AudioTest {...props} />;

export default withTracker(() => ({
  outputDeviceId: Service.outputDeviceId(),
  handlePlayAudioSample: (deviceId) => {
    const sound = new Audio(`${window.meetingClientSettings.public.app.cdn + window.meetingClientSettings.public.app.basename + window.meetingClientSettings.public.app.instanceId}/resources/sounds/audioSample.mp3`);
    sound.addEventListener('ended', () => { sound.src = null; });
    if (deviceId && sound.setSinkId) sound.setSinkId(deviceId);
    sound.play();
  },
}))(AudioTestContainer);
