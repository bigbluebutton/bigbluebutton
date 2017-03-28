import React from 'react';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { clearModal } from '/imports/ui/components/app/service';
import styles from '../audio-modal/styles.scss';

import DeviceSelector from '/imports/ui/components/audio/device-selector/component';
import AudioStreamVolume from '/imports/ui/components/audio/audio-stream-volume/component';
import EnterAudioContainer from '/imports/ui/components/audio/enter-audio/container';
import AudioTestContainer from '/imports/ui/components/audio/audio-test/container';
import cx from 'classnames';

class AudioSettings extends React.Component {
  constructor(props) {
    super(props);

    this.chooseAudio = this.chooseAudio.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOutputChange = this.handleOutputChange.bind(this);
    this.handleClose = this.handleClose.bind(this);

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

  handleClose() {
    this.setState({ isOpen: false });
    clearModal();
  }

  render() {
    const {
      intl,
    } = this.props;

    return (
      <div>
        <div className={styles.topRow}>
          <Button className={styles.backBtn}
            label={intl.formatMessage(intlMessages.backLabel)}
            icon={'left_arrow'}
            size={'md'}
            color={'primary'}
            ghost={true}
            onClick={this.chooseAudio}
          />
          <div className={cx(styles.title, styles.chooseAudio)}>
            <FormattedMessage
              id="app.audio.audioSettings.titleLabel"
            />
          </div>
        </div>

        <div className={styles.form}>

          <div className={styles.row}>
            <div className={styles.audioNote}>
              <FormattedMessage
                  id="app.audio.audioSettings.descriptionLabel"
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={cx(styles.label, styles.labelSmall)}>
                  Microphone source
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
                  Speaker source
                </label>
                <DeviceSelector
                    value={this.state.outputDeviceId}
                    className={styles.select}
                    kind="audiooutput"
                    onChange={this.handleOutputChange} />
              </div>
            </div>
          </div>

          <div className={styles.row}>
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
            <div className={styles.col}>
              <label className={styles.label}>&nbsp;</label>
              <AudioTestContainer/>
            </div>
          </div>
        </div>

        <div className={styles.enterAudio}>
          <EnterAudioContainer isFullAudio={true}/>
        </div>
      </div>
    );
  }
};

const intlMessages = defineMessages({
  backLabel: {
    id: 'app.audio.backLabel',
  },
});

export default injectIntl(AudioSettings);
