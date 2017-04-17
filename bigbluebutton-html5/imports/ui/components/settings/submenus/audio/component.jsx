import React from 'react';
import BaseMenu from '../base/component';
import styles from '../styles.scss';
import { defineMessages, injectIntl } from 'react-intl';
import DeviceSelector from '/imports/ui/components/audio/device-selector/component';
import AudioStreamVolume from '/imports/ui/components/audio/audio-stream-volume/component';
import AudioTestContainer from '/imports/ui/components/audio-test/container';
import cx from 'classnames';

const intlMessages = defineMessages({
  micSource: {
    id: 'app.submenu.audio.micSourceLabel',
    description: 'Label for microphone source',
  },
  speakerSource: {
    id: 'app.submenu.audio.speakerSourceLabel',
    description: 'Label for speaker source',
  },
  streamVolume: {
    id: 'app.submenu.audio.streamVolumeLabel',
    description: 'Label for stream volume',
  },
});

class AudioMenu extends BaseMenu {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOutputChange = this.handleOutputChange.bind(this);

    this.state = {
      settingsName: 'audio',
      settings: props.settings,
    };
  }

  chooseAudio() {
    this.props.changeMenu(this.props.JOIN_AUDIO);
  }

  handleSelectChange(fieldname, options, e) {
    let obj = this.state;
    obj.settings[fieldname] = options[e.target.value];
    this.setState(obj);
    this.handleUpdateSettings('audio', obj);
  }

  handleInputChange(deviceId) {
    let obj = this.state;
    obj.settings.inputDeviceId = deviceId;
    this.setState(obj);
    this.handleUpdateSettings('audio', obj);
  }

  handleOutputChange(deviceId) {
    let obj = this.state;
    obj.settings.outputDeviceId = deviceId;
    this.setState(obj);
    this.handleUpdateSettings('audio', obj);
  }

  render() {
    const { intl } = this.props;

    return (
      <div>
        <div className={styles.header}>
          <h3 className={styles.title}>Audio</h3>
        </div>

        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={cx(styles.label, styles.labelSmall)}>
                  {intl.formatMessage(intlMessages.micSource)}
                </label>
                <DeviceSelector
                  value={this.state.inputDeviceId}
                  className={styles.select}
                  kind="audioinput"
                  onChange={this.handleInputChange} />
              </div>
            </div>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={cx(styles.label, styles.labelSmall)}>
                  {intl.formatMessage(intlMessages.streamVolume)}
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
                  {intl.formatMessage(intlMessages.speakerSource)}
                </label>
                <DeviceSelector
                  value={this.state.outputDeviceId}
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

export default injectIntl(AudioMenu);
