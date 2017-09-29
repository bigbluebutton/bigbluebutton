import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { withModalMounter } from '/imports/ui/components/modal/service';
import DeviceSelector from '/imports/ui/components/audio/device-selector/component';
import AudioStreamVolume from '/imports/ui/components/audio/audio-stream-volume/component';
import EnterAudioContainer from '/imports/ui/components/audio/enter-audio/container';
import AudioTestContainer from '/imports/ui/components/audio/audio-test/container';
import cx from 'classnames';
import styles from './styles';

const intlMessages = defineMessages({
  backLabel: {
    id: 'app.audio.backLabel',
    description: 'audio settings back button label',
  },
  titleLabel: {
    id: 'app.audio.audioSettings.titleLabel',
    description: 'audio setting title label',
  },
  descriptionLabel: {
    id: 'app.audio.audioSettings.descriptionLabel',
    description: 'audio settings description label',
  },
  micSourceLabel: {
    id: 'app.audio.audioSettings.microphoneSourceLabel',
    description: 'Label for mic source',
  },
  speakerSourceLabel: {
    id: 'app.audio.audioSettings.speakerSourceLabel',
    description: 'Label for speaker source',
  },
  streamVolumeLabel: {
    id: 'app.audio.audioSettings.microphoneStreamLabel',
    description: 'Label for stream volume',
  },
  enterSessionLabel: {
    id: 'app.audio.enterSessionLabel',
    description: 'enter session button label',
  },
});

class AudioSettings extends React.Component {
  constructor(props) {
    super(props);

    this.chooseAudio = this.chooseAudio.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOutputChange = this.handleOutputChange.bind(this);
    this.handleBack = props.handleBack;
    this.handleJoin = props.handleJoin;
    this.joinEchoTest = props.joinEchoTest;
    this.exitAudio = props.exitAudio;

    this.state = {
      inputDeviceId: undefined,
      outputDeviceId: undefined,
    };
  }

  componentDidMount() {
    this.joinEchoTest();
  }

  componentWillUnmount() {
    const {
      isEchoTest,
    } = this.props;

    if (isEchoTest) {
      this.exitAudio();
    }
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

  handleOutputChange(deviceId, device) {
    console.log(device);
    console.log(`OUTPUT DEVICE CHANGED: ${deviceId}`);
    this.setState({
      outputDeviceId: deviceId,
    });
  }

  // handleClose() {
  //   this.setState({ isOpen: false });
  //   this.props.mountModal(null);
  // }

  render() {
    const {
      isConnecting,
      intl,
    } = this.props;

    // return this.renderCalling();
    return (
      <div>
        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.audioNote}>
              {intl.formatMessage(intlMessages.descriptionLabel)}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={cx(styles.label, styles.labelSmall)}>
                  {intl.formatMessage(intlMessages.micSourceLabel)}
                  <DeviceSelector
                    value={this.state.inputDeviceId}
                    className={styles.select}
                    kind="audioinput"
                    onChange={this.handleInputChange}
                  />
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={cx(styles.label, styles.labelSmall)}>
                  {intl.formatMessage(intlMessages.speakerSourceLabel)}
                  <DeviceSelector
                    value={this.state.outputDeviceId}
                    className={styles.select}
                    kind="audiooutput"
                    onChange={this.handleOutputChange}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={cx(styles.label, styles.labelSmall)}>
                  {intl.formatMessage(intlMessages.streamVolumeLabel)}
                  <AudioStreamVolume
                    deviceId={this.state.inputDeviceId}
                    className={styles.audioMeter}
                  />
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <label className={styles.label}> </label>
              <AudioTestContainer />
            </div>
          </div>
        </div>


        <div className={styles.enterAudio}>
          <Button
            className={styles.backBtn}
            label={intl.formatMessage(intlMessages.backLabel)}
            size={'md'}
            color={'primary'}
            onClick={this.handleBack}
            disabled={isConnecting}
            ghost
          />
          <Button
            size={'md'}
            color={'primary'}
            onClick={this.handleJoin}
            disabled={isConnecting}
          >
            <span className={ isConnecting ? styles.calling : null}>
              { isConnecting ? 'Calling echo test' : intl.formatMessage(intlMessages.enterSessionLabel)}
            </span>
          </Button>
        </div>
      </div>
    )
  }

}

export default withModalMounter(injectIntl(AudioSettings));
