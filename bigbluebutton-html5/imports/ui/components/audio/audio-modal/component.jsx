import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from '/imports/ui/components/modal/simple/component';
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
  iOSError: {
    id: 'app.audioModal.iOSBrowser',
    description: 'Audio/Video Not supported warning',
  },
  iOSErrorDescription: {
    id: 'app.audioModal.iOSErrorDescription',
    description: 'Audio/Video not supported description',
  },
  iOSErrorRecommendation: {
    id: 'app.audioModal.iOSErrorRecommendation',
    description: 'Audio/Video recommended action',
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
      hasError: false,
    };

    const { intl } = props;

    this.handleGoToAudioOptions = this.handleGoToAudioOptions.bind(this);
    this.handleGoToAudioSettings = this.handleGoToAudioSettings.bind(this);
    this.handleRetryGoToEchoTest = this.handleRetryGoToEchoTest.bind(this);
    this.handleGoToEchoTest = this.handleGoToEchoTest.bind(this);
    this.handleJoinMicrophone = this.handleJoinMicrophone.bind(this);
    this.handleJoinListenOnly = this.handleJoinListenOnly.bind(this);
    this.skipAudioOptions = this.skipAudioOptions.bind(this);

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
      audioLocked,
    } = this.props;

    if (joinFullAudioImmediately) {
      this.handleJoinMicrophone();
    }

    if (joinFullAudioEchoTest) {
      this.handleGoToEchoTest();
    }

    if (forceListenOnlyAttendee || audioLocked) {
      this.handleJoinListenOnly();
    }
  }

  componentWillUnmount() {
    const {
      isEchoTest,
      exitAudio,
    } = this.props;

    if (isEchoTest) {
      exitAudio();
    }
  }

  handleGoToAudioOptions() {
    this.setState({
      content: null,
      hasError: true,
    });
  }

  handleGoToAudioSettings() {
    const { leaveEchoTest } = this.props;
    leaveEchoTest().then(() => {
      this.setState({
        content: 'settings',
      });
    });
  }

  handleRetryGoToEchoTest() {
    const { joinFullAudioImmediately } = this.props;

    this.setState({
      hasError: false,
      content: null,
    });

    if (joinFullAudioImmediately) return this.joinMicrophone();

    return this.handleGoToEchoTest();
  }

  handleGoToEchoTest() {
    const {
      inputDeviceId,
      outputDeviceId,
      joinEchoTest,
    } = this.props;

    this.setState({
      hasError: false,
    });

    return joinEchoTest().then(() => {
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

    this.setState({
      hasError: false,
    });

    joinMicrophone().catch(this.handleGoToAudioOptions);
  }

  skipAudioOptions() {
    const {
      isConnecting,
      joinFullAudioImmediately,
      joinFullAudioEchoTest,
      forceListenOnlyAttendee,
    } = this.props;

    const {
      content,
      hasError,
    } = this.state;


    return (
      isConnecting
      || forceListenOnlyAttendee
      || joinFullAudioImmediately
      || joinFullAudioEchoTest
    ) && !content && !hasError;
  }

  renderAudioOptions() {
    const {
      intl,
      listenOnlyMode,
      forceListenOnlyAttendee,
      skipCheck,
      audioLocked,
      isMobileNative,
    } = this.props;

    const showMicrophone = forceListenOnlyAttendee || audioLocked;

    return (
      <span className={styles.audioOptions}>
        {!showMicrophone && !isMobileNative
          ? (
            <Button
              className={styles.audioBtn}
              label={intl.formatMessage(intlMessages.microphoneLabel)}
              icon="unmute"
              circle
              size="jumbo"
              disabled={audioLocked}
              onClick={skipCheck ? this.handleJoinMicrophone : this.handleGoToEchoTest}
            />
          )
          : null}
        {listenOnlyMode
          ? (
            <Button
              className={styles.audioBtn}
              label={intl.formatMessage(intlMessages.listenOnlyLabel)}
              icon="listen"
              circle
              size="jumbo"
              onClick={this.handleJoinListenOnly}
            />
          )
          : null}
      </span>
    );
  }

  renderContent() {
    const {
      isEchoTest,
      intl,
      isIOSChrome,
    } = this.props;

    const { content } = this.state;

    if (isIOSChrome) {
      return (
        <div>
          <div className={styles.warning}>!</div>
          <h4 className={styles.main}>{intl.formatMessage(intlMessages.iOSError)}</h4>
          <div className={styles.text}>{intl.formatMessage(intlMessages.iOSErrorDescription)}</div>
          <div className={styles.text}>
            {intl.formatMessage(intlMessages.iOSErrorRecommendation)}
          </div>
        </div>);
    }
    if (this.skipAudioOptions()) {
      return (
        <div className={styles.connecting} role="alert">
          <span>
            {!isEchoTest
              ? intl.formatMessage(intlMessages.connecting)
              : intl.formatMessage(intlMessages.connectingEchoTest)
            }
          </span>
          <span className={styles.connectingAnimation} />
        </div>
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
      joinEchoTest,
      changeInputDevice,
      changeOutputDevice,
    } = this.props;

    return (
      <AudioSettings
        handleBack={this.handleGoToAudioOptions}
        handleRetry={this.handleRetryGoToEchoTest}
        joinEchoTest={joinEchoTest}
        changeInputDevice={changeInputDevice}
        changeOutputDevice={changeOutputDevice}
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
      showPermissionsOvelay,
      isIOSChrome,
      closeModal,
    } = this.props;

    const { content } = this.state;

    return (
      <span>
        {showPermissionsOvelay ? <PermissionsOverlay /> : null}
        <Modal
          overlayClassName={styles.overlay}
          className={styles.modal}
          onRequestClose={closeModal}
          hideBorder
        >
          {!this.skipAudioOptions()

            ? (
              <header
                data-test="audioModalHeader"
                className={styles.header}
              >
                {
                isIOSChrome ? null
                  : (
                    <h3 className={styles.title}>
                      {content
                        ? this.contents[content].title
                        : intl.formatMessage(intlMessages.audioChoiceLabel)}
                    </h3>
                  )
            }
              </header>
            )
            : null
          }
          <div className={styles.content}>
            {this.renderContent()}
          </div>
        </Modal>
      </span>
    );
  }
}

AudioModal.propTypes = propTypes;
AudioModal.defaultProps = defaultProps;

export default injectIntl(AudioModal);
