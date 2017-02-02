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
    this.handleClose = this.handleClose.bind(this);

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

  handleClose() {
    this.setState({ isOpen: false });
    clearModal();
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
          <div className={styles.title}>
            Choose your audio settings
          </div>
        </div>
        <div className={styles.audioNote}>
          Please note, a dialog will appear in your browser, requiring you to accept sharing your microphone.
        </div>
        <div className={styles.containerLeftHalfContent}>
          <span className={styles.heading}>Microphone source</span>
          <DeviceSelector
            className={styles.item}
            kind="audioinput"
            onChange={this.handleInputChange} />
          <span className={styles.heading}>Your audio stream volume</span>
          <AudioStreamVolume
            className={styles.item}
            deviceId={this.state.inputDeviceId} />
        </div>
        <div className={styles.containerRightHalfContent}>
          <span className={styles.heading}>Speaker source</span>
          <DeviceSelector
            className={styles.item}
            kind="audiooutput"
            onChange={this.handleOutputChange} />
          <AudioTestContainer />
          <EnterAudioContainer isFullAudio={true}/>
        </div>
      </div>
    );
  }
};
