import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import InputStreamLiveSelector from './component';
import Service from '../../service';

class InputStreamLiveSelectorContainer extends PureComponent {
  render() {
    return (
      <InputStreamLiveSelector {...this.props} />
    );
  }
}

export default withTracker(() => {
  return {
    isAudioConnected: Service.isConnected(),
    isListenOnly: Service.isListenOnly(),
    currentInputDeviceId: Service.inputDeviceId(),
    currentOutputDeviceId: Service.outputDeviceId(),
    liveChangeInputDevice: Service.liveChangeInputDevice,
    liveChangeOutputDevice: Service.changeOutputDevice,
    exitAudio: Service.exitAudio,
  };
})(InputStreamLiveSelectorContainer);
