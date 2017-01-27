import React, { Component } from 'react';
import BaseMenu from '../base/component';
import styles from '../styles.scss';

import DeviceSelector from '/imports/ui/components/audio/device-selector/component';
import AudioStreamVolume from '/imports/ui/components/audio/audio-stream-volume/component';
import AudioTestContainer from '/imports/ui/components/audio-test/container';
import cx from 'classnames';

export default class AudioMenu extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOutputChange = this.handleOutputChange.bind(this);

    console.log(props);
    this.handleUpdateSettings = props.handleUpdateSettings;

    this.state = {
      inputDeviceId: undefined,
    };
  }

  chooseAudio() {
    this.props.changeMenu(this.props.JOIN_AUDIO);
  }

  handleInputChange(deviceId) {
    this.handleUpdateSettings('audio', {
      inputDeviceId: deviceId,
    });
  }

  handleOutputChange(deviceId) {
    this.handleUpdateSettings('audio', {
      outputDeviceId: deviceId,
    });
  }

  render() {
    return (
      <div className={styles.tabContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>Audio</h3>
        </div>

        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={cx(styles.label, styles.labelSmall)}>
                  Microphone source
                </label>
                <DeviceSelector
                  className={styles.select}
                  kind="audioinput"
                  onChange={this.handleInputChange} />
              </div>
            </div>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={cx(styles.label, styles.labelSmall)}>
                  Your audio stream volume
                </label>
                <AudioStreamVolume
                  deviceId={this.state.inputDeviceId}
                  className={styles.audioMeter} />
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={cx(styles.label, styles.labelSmall)}>
                  Speaker source
                </label>
                <DeviceSelector
                  className={styles.select}
                  kind="audiooutput"
                  onChange={this.handleOutputChange} />
                </div>
            </div>
            <div className={styles.col}>
              <label className={styles.label}>&nbsp;</label>
              <AudioTestContainer/>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
