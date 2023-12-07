import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/service';
import AudioTest from './component';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';

const AudioTestContainer = (props) => <AudioTest {...props} />;

export default withTracker(() => {
  const [MeetingSettings] = useMeetingSettings();
  const appConfig = MeetingSettings.public.app;

  return {
    outputDeviceId: Service.outputDeviceId(),
    handlePlayAudioSample: (deviceId) => {
      const sound = new Audio(`${appConfig.cdn + appConfig.basename + appConfig.instanceId}/resources/sounds/audioSample.mp3`);
      sound.addEventListener('ended', () => { sound.src = null; });
      if (deviceId && sound.setSinkId) sound.setSinkId(deviceId);
      sound.play();
    },
  };
})(AudioTestContainer);
