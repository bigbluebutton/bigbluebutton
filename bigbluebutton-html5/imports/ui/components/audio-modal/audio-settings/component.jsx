import React from 'react';
import Button from '/imports/ui/components/button/component';
import { clearModal } from '/imports/ui/components/app/service';
import styles from '../styles.scss';

import DeviceSelector from '/imports/ui/components/audio/device-selector/component';
import AudioStreamVolume from '/imports/ui/components/audio/audio-stream-volume/component';
import EnterAudioContainer from '/imports/ui/components/enter-audio/container';
import AudioTestContainer from '/imports/ui/components/audio-test/container';

export default class AudioSettings extends React.Component {
  constructor(props) {
    super(props);

    this.chooseAudio = this.chooseAudio.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOutputChange = this.handleOutputChange.bind(this);

    this.state = {
      inputDeviceId: undefined,
    }
  }

  chooseAudio() {
    this.props.changeMenu(this.props.JOIN_AUDIO);
  }

  handleInputChange(deviceId) {
    console.log(`INPUT DEVICE CHANGED: ${deviceId}`);
    this.setState({
      inputDeviceId: deviceId
    });
  }

  handleOutputChange(deviceId) {
    console.log(`OUTPUT DEVICE CHANGED: ${deviceId}`);
  }

  render() {
    return (
      <div>
        <div className={styles.center}>
          <Button className={styles.backBtn}
            label={'Back'}
            icon={'left-arrow'}
            size={'md'}
            color={'primary'}
            ghost={true}
            onClick={this.chooseAudio}
          />
          <div>
            Choose your audio settings
          </div>
        </div>
        <div className={styles.containerLeftHalfContent}>
          <DeviceSelector
            className={styles.item}
            kind="audioinput"
            onChange={this.handleInputChange} />
          <AudioStreamVolume
            className={styles.item}
            deviceId={this.state.inputDeviceId} />
          <DeviceSelector
            className={styles.item}
            kind="audiooutput"
            onChange={this.handleOutputChange} />
          <AudioTestContainer />
        </div>
        <div className={styles.containerRightHalfContent}>
          <EnterAudioContainer isFullAudio={true}/>
        </div>
      </div>
    );
  }
};
