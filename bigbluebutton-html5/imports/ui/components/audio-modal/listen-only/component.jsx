import React from 'react';
import Button from '/imports/ui/components/button/component';
import { clearModal } from '/imports/ui/components/app/service';
import styles from '../styles.scss';

import DeviceSelector from '/imports/ui/components/audio/device-selector/component';
import AudioTestContainer from '/imports/ui/components/audio-test/container';
import EnterAudioContainer from '/imports/ui/components/enter-audio/container';

export default class ListenOnly extends React.Component {
  constructor(props) {
    super(props);

    this.chooseAudio = this.chooseAudio.bind(this);
    this.handleOutputChange = this.handleOutputChange.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      inputDeviceId: undefined,
    };
  }

  chooseAudio() {
    this.props.changeMenu(this.props.JOIN_AUDIO);
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
          <Button className={styles.closeBtn}
            label={'Close'}
            icon={'close'}
            size={'lg'}
            circle={true}
            hideLabel={true}
            onClick={this.handleClose}
          />
          <div>
            Choose your listen only settings
          </div>
        </div>
        <div>
          <div className={styles.containerLeftHalfContent}>
            <DeviceSelector
              className={styles.item}
              kind="audiooutput"
              onChange={this.handleOutputChange} />
            <AudioTestContainer />
          </div>
          <div className={styles.containerRightHalfContent}>
            <EnterAudioContainer isFullAudio={false}/>
          </div>
        </div>
      </div>
    );
  }
};
