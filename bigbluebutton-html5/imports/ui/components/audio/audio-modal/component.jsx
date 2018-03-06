import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ModalBase from '/imports/ui/components/modal/base/component';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { styles } from './styles';
import PermissionsOverlay from '../permissions-overlay/component';
import AudioSettings from '../audio-settings/component';
import EchoTest from '../echo-test/component';
import Help from '../help/component';

const propTypes = {
  intl: intlShape.isRequired,
  closeModal: PropTypes.func.isRequired,
  joinMicrophone: PropTypes.func.isRequired,
  joinListenOnly: PropTypes.func.isRequired,
  joinEchoTest: PropTypes.func.isRequired,
  exitAudio: PropTypes.func.isRequired,
  leaveEchoTest: PropTypes.func.isRequired,
  changeInputDevice: PropTypes.func.isRequired,
  changeOutputDevice: PropTypes.func.isRequired,
  isEchoTest: PropTypes.bool.isRequired,
  isConnecting: PropTypes.bool.isRequired,
  isConnected: PropTypes.bool.isRequired,
  inputDeviceId: PropTypes.string,
  outputDeviceId: PropTypes.string,
  showPermissionsOvelay: PropTypes.bool.isRequired,
  listenOnlyMode: PropTypes.bool.isRequired,
  skipCheck: PropTypes.bool.isRequired,
  joinFullAudioImmediately: PropTypes.bool.isRequired,
  joinFullAudioEchoTest: PropTypes.bool.isRequired,
  forceListenOnlyAttendee: PropTypes.bool.isRequired,
};

const defaultProps = {
  inputDeviceId: null,
  outputDeviceId: null,
};

const intlMessages = defineMessages({
  microphoneLabel: {
    id: 'app.audioModal.microphoneLabel',
    description: 'Join mic audio button label',
  },
  listenOnlyLabel: {
    id: 'app.audioModal.listenOnlyLabel',
    description: 'Join listen only audio button label',
  },
  closeLabel: {
    id: 'app.audioModal.closeLabel',
    description: 'close audio modal button label',
  },
  audioChoiceLabel: {
    id: 'app.audioModal.audioChoiceLabel',
    description: 'Join audio modal title',
  },
  echoTestTitle: {
    id: 'app.audioModal.echoTestTitle',
    description: 'Title for the echo test',
  },
  settingsTitle: {
    id: 'app.audioModal.settingsTitle',
    description: 'Title for the audio modal',
  },
  helpTitle: {
    id: 'app.audioModal.helpTitle',
    description: 'Title for the audio help',
  },
  connecting: {
    id: 'app.audioModal.connecting',
    description: 'Message for audio connecting',
  },
  connectingEchoTest: {
    id: 'app.audioModal.connectingEchoTest',
    description: 'Message for echo test connecting',
  },
});

class AudioModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: null,
    };

    const {
      intl,
      closeModal,
      joinEchoTest,
      exitAudio,
      leaveEchoTest,
      changeInputDevice,
      changeOutputDevice,
    } = props;

    this.handleGoToAudioOptions = this.handleGoToAudioOptions.bind(this);
    this.handleGoToAudioSettings = this.handleGoToAudioSettings.bind(this);
    this.handleGoToEchoTest = this.handleGoToEchoTest.bind(this);
    this.handleJoinMicrophone = this.handleJoinMicrophone.bind(this);
    this.handleJoinListenOnly = this.handleJoinListenOnly.bind(this);
    this.closeModal = closeModal;
    this.joinEchoTest = joinEchoTest;
    this.exitAudio = exitAudio;
    this.leaveEchoTest = leaveEchoTest;
    this.changeInputDevice = changeInputDevice;
    this.changeOutputDevice = changeOutputDevice;

    this.contents = {
      echoTest: {
        title: intl.formatMessage(intlMessages.echoTestTitle),
        component: () => this.renderEchoTest(),
      },
      settings: {
        title: intl.formatMessage(intlMessages.settingsTitle),
        component: () => this.renderAudioSettings(),
      },
      help: {
        title: intl.formatMessage(intlMessages.helpTitle),
        component: () => this.renderHelp(),
      },
    };
  }

  componentWillMount() {
    const {
      joinFullAudioImmediately,
      joinFullAudioEchoTest,
      forceListenOnlyAttendee,
    } = this.props;

    console.log('AudioModal.componentWillMount.joinFullAudioImmediately', joinFullAudioImmediately);
    console.log('AudioModal.componentWillMount.joinFullAudioEchoTest', joinFullAudioEchoTest);
    console.log('AudioModal.componentWillMount.forceListenOnlyAttendee', forceListenOnlyAttendee);

    if (joinFullAudioImmediately) {
      this.handleJoinMicrophone();
    }

    if (joinFullAudioEchoTest) {
      this.handleGoToEchoTest();
    }

    if (forceListenOnlyAttendee) {
      this.handleJoinListenOnly();
    }
  }

  componentWillUnmount() {
    const {
      isEchoTest,
    } = this.props;

    if (isEchoTest) {
      this.exitAudio();
    }
  }

  handleGoToAudioOptions() {
    this.setState({
      content: null,
    });
  }

  handleGoToAudioSettings() {
    this.leaveEchoTest().then(() => {
      this.setState({
        content: 'settings',
      });
    });
  }

  handleGoToEchoTest() {
    const {
      inputDeviceId,
      outputDeviceId,
      skipCheck,
    } = this.props;


    if (skipCheck) {
      return this.handleJoinMicrophone();
    }

    return this.joinEchoTest().then(() => {
      console.log(inputDeviceId, outputDeviceId);
      this.setState({
        content: 'echoTest',
      });
    }).catch((err) => {
      if (err.type === 'MEDIA_ERROR') {
        this.setState({
          content: 'help',
        });
      }
    });
  }

  handleJoinListenOnly() {
    const {
      joinListenOnly,
    } = this.props;

    return joinListenOnly().catch((err) => {
      if (err.type === 'MEDIA_ERROR') {
        this.setState({
          content: 'help',
        });
      }
    });
  }

  handleJoinMicrophone() {
    const {
      joinMicrophone,
    } = this.props;

    joinMicrophone().catch(this.handleGoToAudioOptions);
  }

  renderAudioOptions() {
    const {
      intl,
      listenOnlyMode,
      forceListenOnlyAttendee,
    } = this.props;

    return (
      <span className={styles.audioOptions}>
        {forceListenOnlyAttendee ?
          null :
          <Button
            className={styles.audioBtn}
            label={intl.formatMessage(intlMessages.microphoneLabel)}
            icon="unmute"
            circle
            size="jumbo"
            onClick={this.handleGoToEchoTest}
          />
        }
        {listenOnlyMode ?
          <Button
            className={styles.audioBtn}
            label={intl.formatMessage(intlMessages.listenOnlyLabel)}
            icon="listen"
            circle
            size="jumbo"
            onClick={this.handleJoinListenOnly}
          />
        : null}
      </span>
    );
  }

  renderContent() {
    const {
      isConnecting,
      isEchoTest,
      intl,
      joinFullAudioImmediately,
      joinFullAudioEchoTest,
      forceListenOnlyAttendee,
    } = this.props;

    const {
      content,
    } = this.state;

    if (
      isConnecting ||
      forceListenOnlyAttendee ||
      joinFullAudioImmediately ||
      (joinFullAudioEchoTest && !content)
    ) {
      return (
        <span className={styles.connecting}>
          { !isEchoTest ?
            intl.formatMessage(intlMessages.connecting) :
            intl.formatMessage(intlMessages.connectingEchoTest)
          }
        </span>
      );
    }
    return content ? this.contents[content].component() : this.renderAudioOptions();
  }

  renderEchoTest() {
    return (
      <EchoTest
        handleNo={this.handleGoToAudioSettings}
        handleYes={this.handleJoinMicrophone}
      />
    );
  }

  renderAudioSettings() {
    const {
      isConnecting,
      isConnected,
      isEchoTest,
      inputDeviceId,
      outputDeviceId,
    } = this.props;

    return (
      <AudioSettings
        handleBack={this.handleGoToAudioOptions}
        handleRetry={this.handleGoToEchoTest}
        joinEchoTest={this.joinEchoTest}
        exitAudio={this.exitAudio}
        changeInputDevice={this.changeInputDevice}
        changeOutputDevice={this.changeOutputDevice}
        isConnecting={isConnecting}
        isConnected={isConnected}
        isEchoTest={isEchoTest}
        inputDeviceId={inputDeviceId}
        outputDeviceId={outputDeviceId}
      />
    );
  }

  renderHelp() {
    return (
      <Help
        handleBack={this.handleGoToAudioOptions}
      />
    );
  }

  render() {
    const {
      intl,
      isConnecting,
      showPermissionsOvelay,
      joinFullAudioImmediately,
      joinFullAudioEchoTest,
      forceListenOnlyAttendee,
    } = this.props;

    const {
      content,
    } = this.state;

    return (
      <span>
        { showPermissionsOvelay ? <PermissionsOverlay /> : null}
        <ModalBase
          overlayClassName={styles.overlay}
          className={styles.modal}
          onRequestClose={this.closeModal}
        >
          { isConnecting ||
            forceListenOnlyAttendee ||
            joinFullAudioImmediately ||
            (joinFullAudioEchoTest && !content) ? null :
            <header
              data-test="audioModalHeader"
              className={styles.header}
            >
              <h3 className={styles.title}>
                { content ?
                  this.contents[content].title :
                  intl.formatMessage(intlMessages.audioChoiceLabel)}
              </h3>
              <Button
                data-test="modalBaseCloseButton"
                className={styles.closeBtn}
                label={intl.formatMessage(intlMessages.closeLabel)}
                icon="close"
                size="md"
                hideLabel
                onClick={this.closeModal}
              />
            </header>
          }
          <div className={styles.content}>
            { this.renderContent() }
          </div>
        </ModalBase>
      </span>
    );
  }
}

AudioModal.propTypes = propTypes;
AudioModal.defaultProps = defaultProps;

export default injectIntl(AudioModal);
