import React from 'react';
import BaseMenu from '../base/component';
import styles from '../styles.scss';

import DeviceSelector from '/imports/ui/components/audio/device-selector/component';
import AudioStreamVolume from '/imports/ui/components/audio/audio-stream-volume/component';
import AudioTestContainer from '/imports/ui/components/audio-test/container';

export default class AudioMenu extends BaseMenu {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOutputChange = this.handleOutputChange.bind(this);

    this.state = {
      inputDeviceId: undefined,
    };
  }

  chooseAudio() {
    this.props.changeMenu(this.props.JOIN_AUDIO);
  }

  handleInputChange(deviceId) {
    console.log(`INPUT DEVICE CHANGED: ${deviceId}`);
    this.setState({
      inputDeviceId: deviceId,
    });
  }

  handleOutputChange(deviceId) {
    console.log(`OUTPUT DEVICE CHANGED: ${deviceId}`);
  }

  getContent() {
    return (
      <div className={styles.full} role='presentation'>
        <div className={styles.containerLeftHalf}>
          <DeviceSelector
            kind="audioinput"
            onChange={this.handleInputChange} />
          <DeviceSelector
            kind="audiooutput"
            onChange={this.handleOutputChange} />
        </div>
        <div className={styles.containerRightHalf}>
          <AudioStreamVolume deviceId={this.state.inputDeviceId}/>
          <AudioTestContainer  />
        </div>
      </div>
    );
  }
};
