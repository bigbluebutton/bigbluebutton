import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import { Session } from 'meteor/session';
import {
  defineMessages, injectIntl, intlShape, FormattedMessage,
} from 'react-intl';
import { styles } from './styles';
import PermissionsOverlay from '../permissions-overlay/component';
import AudioSettings from '../audio-settings/component';
import EchoTest from '../echo-test/component';
import Help from '../help/component';
import AudioDial from '../audio-dial/component';
import AudioAutoplayPrompt from '../autoplay/component';

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
  formattedDialNum: PropTypes.string.isRequired,
  showPermissionsOvelay: PropTypes.bool.isRequired,
  listenOnlyMode: PropTypes.bool.isRequired,
  skipCheck: PropTypes.bool.isRequired,
  joinFullAudioImmediately: PropTypes.bool.isRequired,
  joinFullAudioEchoTest: PropTypes.bool.isRequired,
  forceListenOnlyAttendee: PropTypes.bool.isRequired,
  audioLocked: PropTypes.bool.isRequired,
  resolve: PropTypes.func,
  isMobileNative: PropTypes.bool.isRequired,
  isIOSChrome: PropTypes.bool.isRequired,
  isIEOrEdge: PropTypes.bool.isRequired,
  hasMediaDevices: PropTypes.bool.isRequired,
  formattedTelVoice: PropTypes.string.isRequired,
  autoplayBlocked: PropTypes.bool.isRequired,
  handleAllowAutoplay: PropTypes.func.isRequired,
};

const defaultProps = {
  inputDeviceId: null,
  outputDeviceId: null,
  resolve: null,
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
  audioDialTitle: {
    id: 'app.audioModal.audioDialTitle',
    description: 'Title for the audio dial',
  },
  connecting: {
    id: 'app.audioModal.connecting',
    description: 'Message for audio connecting',
  },
  connectingEchoTest: {
    id: 'app.audioModal.connectingEchoTest',
    description: 'Message for echo test connecting',
  },
  ariaModalTitle: {
    id: 'app.audioModal.ariaTitle',
    description: 'aria label for modal title',
  },
  autoplayPromptTitle: {
    id: 'app.audioModal.autoplayBlockedDesc',
    description: 'Message for autoplay audio block',
  },
});

class AudioModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: null,
      hasError: false,
      errCode: null,
    };

    this.handleGoToAudioOptions = this.handleGoToAudioOptions.bind(this);
    this.handleGoToAudioSettings = this.handleGoToAudioSettings.bind(this);
    this.handleRetryGoToEchoTest = this.handleRetryGoToEchoTest.bind(this);
    this.handleGoToEchoTest = this.handleGoToEchoTest.bind(this);
    this.handleJoinMicrophone = this.handleJoinMicrophone.bind(this);
    this.handleJoinListenOnly = this.handleJoinListenOnly.bind(this);
    this.skipAudioOptions = this.skipAudioOptions.bind(this);

    this.contents = {
      echoTest: {
        title: intlMessages.echoTestTitle,
        component: () => this.renderEchoTest(),
      },
      settings: {
        title: intlMessages.settingsTitle,
        component: () => this.renderAudioSettings(),
      },
      help: {
        title: intlMessages.helpTitle,
        component: () => this.renderHelp(),
      },
      audioDial: {
        title: intlMessages.audioDialTitle,
        component: () => this.renderAudioDial(),
      },
      autoplayBlocked: {
        title: intlMessages.autoplayPromptTitle,
        component: () => this.renderAutoplayOverlay(),
      },
    };
    this.failedMediaElements = [];
  }

  componentDidMount() {
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

  componentDidUpdate(prevProps) {
    const { autoplayBlocked, closeModal } = this.props;

    if (autoplayBlocked !== prevProps.autoplayBlocked) {
      autoplayBlocked ? this.setState({ content: 'autoplayBlocked' }) : closeModal();
    }
  }

  componentWillUnmount() {
    const {
      isEchoTest,
      exitAudio,
      resolve,
    } = this.props;

    if (isEchoTest) {
      exitAudio();
    }
    if (resolve) resolve();
    Session.set('audioModalIsOpen', false);
  }

  handleGoToAudioOptions() {
    this.setState({
      content: null,
      hasError: true,
      disableActions: false,
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
    const { AudioError } = this.props;
    const { MIC_ERROR } = AudioError;
    const noSSL = !window.location.protocol.includes('https');

    if (noSSL) {
      return this.setState({
        content: 'help',
        errCode: MIC_ERROR.NO_SSL,
      });
    }

    const {
      joinEchoTest,
      isConnecting,
    } = this.props;

    const {
      disableActions,
    } = this.state;

    if (disableActions && isConnecting) return;

    this.setState({
      hasError: false,
      disableActions: true,
    });

    return joinEchoTest().then(() => {
      //console.log(inputDeviceId, outputDeviceId);
      this.setState({
        content: 'echoTest',
        disableActions: false,
      });
    }).catch((err) => {
      const { type } = err;
      switch (type) {
        case 'MEDIA_ERROR':
          this.setState({
            content: 'help',
            errCode: 0,
            disableActions: false,
          });
          break;
        case 'CONNECTION_ERROR':
          this.setState({
            errCode: 0,
            disableActions: false,
          });
          break;
        default:
          this.setState({
            errCode: 0,
            disableActions: false,
          });
          break;
      }
    });
  }

  handleJoinListenOnly() {
    const {
      joinListenOnly,
    } = this.props;

    const {
      disableActions,
    } = this.state;

    if (disableActions) return;

    this.setState({
      disableActions: true,
    });

    return joinListenOnly().then(() => {
      this.setState({
        disableActions: false,
      });
    }).catch((err) => {
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

    const {
      disableActions,
    } = this.state;

    if (disableActions) return;

    this.setState({
      hasError: false,
      disableActions: true,
    });

    joinMicrophone().then(() => {
      this.setState({
        disableActions: false,
      });
    }).catch(this.handleGoToAudioOptions);
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
      formattedDialNum,
      isRTL,
    } = this.props;

    const showMicrophone = forceListenOnlyAttendee || audioLocked;

    const arrow = isRTL ? '←' : '→';
    const dialAudioLabel = `${intl.formatMessage(intlMessages.audioDialTitle)} ${arrow}`;

    return (
      <div>
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
        {formattedDialNum ? (
          <Button
            className={styles.audioDial}
            label={dialAudioLabel}
            size="md"
            color="primary"
            onClick={() => {
              this.setState({
                content: 'audioDial',
              });
            }}
            ghost
          />
        ) : null}
      </div>
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
    const { errCode } = this.state;
    const { AudioError } = this.props;

    const audioErr = {
      ...AudioError,
      code: errCode,
    };

    return (
      <Help
        handleBack={this.handleGoToAudioOptions}
        audioErr={audioErr}
      />
    );
  }

  renderAudioDial() {
    const { formattedDialNum, formattedTelVoice } = this.props;
    return (
      <AudioDial
        formattedDialNum={formattedDialNum}
        telVoice={formattedTelVoice}
        handleBack={this.handleGoToAudioOptions}
      />
    );
  }

  renderAutoplayOverlay() {
    const { handleAllowAutoplay } = this.props;
    return (
      <AudioAutoplayPrompt
        handleAllowAutoplay={handleAllowAutoplay}
      />
    );
  }

  render() {
    const {
      intl,
      showPermissionsOvelay,
      isIOSChrome,
      closeModal,
      isIEOrEdge,
    } = this.props;

    const { content } = this.state;

    return (
      <span>
        {showPermissionsOvelay ? <PermissionsOverlay closeModal={closeModal} /> : null}
        <Modal
          overlayClassName={styles.overlay}
          className={styles.modal}
          onRequestClose={closeModal}
          hideBorder
          contentLabel={intl.formatMessage(intlMessages.ariaModalTitle)}
        >
          {isIEOrEdge ? (
            <p className={cx(styles.text, styles.browserWarning)}>
              <FormattedMessage
                id="app.audioModal.unsupportedBrowserLabel"
                description="Warning when someone joins with a browser that isnt supported"
                values={{
                  0: <a href="https://www.google.com/chrome/">Chrome</a>,
                  1: <a href="https://getfirefox.com">Firefox</a>,
                }}
              />
            </p>
          ) : null}
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
                          ? intl.formatMessage(this.contents[content].title)
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
