import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import { Session } from 'meteor/session';
import {
  defineMessages, injectIntl, FormattedMessage,
} from 'react-intl';
import { styles } from './styles';
import PermissionsOverlay from '../permissions-overlay/component';
import AudioSettings from '../audio-settings/component';
import EchoTest from '../echo-test/component';
import Help from '../help/component';
import AudioDial from '../audio-dial/component';
import AudioAutoplayPrompt from '../autoplay/component';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
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
  isUsingAudio: PropTypes.bool.isRequired,
  inputDeviceId: PropTypes.string,
  outputDeviceId: PropTypes.string,
  formattedDialNum: PropTypes.string.isRequired,
  showPermissionsOvelay: PropTypes.bool.isRequired,
  listenOnlyMode: PropTypes.bool.isRequired,
  joinFullAudioImmediately: PropTypes.bool,
  forceListenOnlyAttendee: PropTypes.bool.isRequired,
  audioLocked: PropTypes.bool.isRequired,
  resolve: PropTypes.func,
  isMobileNative: PropTypes.bool.isRequired,
  isIOSChrome: PropTypes.bool.isRequired,
  isIE: PropTypes.bool.isRequired,
  formattedTelVoice: PropTypes.string.isRequired,
  autoplayBlocked: PropTypes.bool.isRequired,
  handleAllowAutoplay: PropTypes.func.isRequired,
};

const defaultProps = {
  inputDeviceId: null,
  outputDeviceId: null,
  resolve: null,
  joinFullAudioImmediately: false,
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
  listenOnlyDesc: {
    id: 'app.audioModal.listenOnlyDesc',
    description: 'Join listen only audio button description',
  },
  microphoneDesc: {
    id: 'app.audioModal.microphoneDesc',
    description: 'Join mic audio button description',
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
      forceListenOnlyAttendee,
      joinFullAudioImmediately,
      listenOnlyMode,
      audioLocked,
      isUsingAudio,
    } = this.props;

    if (!isUsingAudio) {
      if (forceListenOnlyAttendee || audioLocked) return this.handleJoinListenOnly();

      if (joinFullAudioImmediately && !listenOnlyMode) return this.handleJoinMicrophone();

      if (!listenOnlyMode) return this.handleGoToEchoTest();
    }
    return false;
  }

  componentDidUpdate(prevProps) {
    const { autoplayBlocked, closeModal } = this.props;

    if (autoplayBlocked !== prevProps.autoplayBlocked) {
      if (autoplayBlocked) {
        this.setContent({ content: 'autoplayBlocked' });
      } else {
        closeModal();
      }
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
    this.setState({
      hasError: false,
      content: null,
    });

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

    if (disableActions && isConnecting) return null;

    this.setState({
      hasError: false,
      disableActions: true,
    });

    return joinEchoTest().then(() => {
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
      isConnecting,
    } = this.props;

    const {
      disableActions,
    } = this.state;

    if (disableActions && isConnecting) return null;

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

    joinMicrophone().then(() => {
      this.setState({
        disableActions: false,
      });
    }).catch(this.handleGoToAudioOptions);
  }

  setContent(content) {
    this.setState(content);
  }

  skipAudioOptions() {
    const {
      isConnecting,
    } = this.props;

    const {
      content,
      hasError,
    } = this.state;

    return isConnecting && !content && !hasError;
  }

  renderAudioOptions() {
    const {
      intl,
      listenOnlyMode,
      forceListenOnlyAttendee,
      joinFullAudioImmediately,
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
              && (
              <>
                <Button
                  className={styles.audioBtn}
                  label={intl.formatMessage(intlMessages.microphoneLabel)}
                  aria-describedby="mic-description"
                  icon="unmute"
                  circle
                  size="jumbo"
                  disabled={audioLocked}
                  onClick={
                    joinFullAudioImmediately
                      ? this.handleJoinMicrophone
                      : this.handleGoToEchoTest
                  }
                />
                <span className="sr-only" id="mic-description">
                  {intl.formatMessage(intlMessages.microphoneDesc)}
                </span>
              </>
              )}
          {listenOnlyMode
              && (
              <>
                <Button
                  className={styles.audioBtn}
                  label={intl.formatMessage(intlMessages.listenOnlyLabel)}
                  aria-describedby="listenOnly-description"
                  icon="listen"
                  circle
                  size="jumbo"
                  onClick={this.handleJoinListenOnly}
                />
                <span className="sr-only" id="listenOnly-description">
                  {intl.formatMessage(intlMessages.listenOnlyDesc)}
                </span>
              </>
              )}
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
        </div>
      );
    }

    if (this.skipAudioOptions()) {
      return (
        <div className={styles.connecting} role="alert">
          <span data-test={!isEchoTest ? 'connecting' : 'connectingToEchoTest'}>
            {intl.formatMessage(intlMessages.connecting)}
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
      isIE,
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
          {isIE ? (
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
          {
            !this.skipAudioOptions()
              ? (
                <header
                  data-test="audioModalHeader"
                  className={styles.header}
                >
                  {
                    isIOSChrome ? null
                      : (
                        <h2 className={styles.title}>
                          {content
                            ? intl.formatMessage(this.contents[content].title)
                            : intl.formatMessage(intlMessages.audioChoiceLabel)}
                        </h2>
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
