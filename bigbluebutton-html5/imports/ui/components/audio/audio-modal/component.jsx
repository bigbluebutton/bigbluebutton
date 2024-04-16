import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import {
  defineMessages, injectIntl, FormattedMessage,
} from 'react-intl';
import Styled from './styles';
import PermissionsOverlay from '../permissions-overlay/component';
import AudioSettings from '../audio-settings/component';
import EchoTest from '../echo-test/component';
import Help from '../help/component';
import AudioDial from '../audio-dial/component';
import AudioAutoplayPrompt from '../autoplay/component';
import Settings from '/imports/ui/services/settings';
import CaptionsSelectContainer from '/imports/ui/components/audio/captions/select/container';

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
  isListenOnly: PropTypes.bool.isRequired,
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
  isIE: PropTypes.bool.isRequired,
  formattedTelVoice: PropTypes.string.isRequired,
  autoplayBlocked: PropTypes.bool.isRequired,
  handleAllowAutoplay: PropTypes.func.isRequired,
  changeInputStream: PropTypes.func.isRequired,
  localEchoEnabled: PropTypes.bool.isRequired,
  showVolumeMeter: PropTypes.bool.isRequired,
  notify: PropTypes.func.isRequired,
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
      errorInfo: null,
    };

    this.handleGoToAudioOptions = this.handleGoToAudioOptions.bind(this);
    this.handleGoToAudioSettings = this.handleGoToAudioSettings.bind(this);
    this.handleRetryGoToEchoTest = this.handleRetryGoToEchoTest.bind(this);
    this.handleGoToEchoTest = this.handleGoToEchoTest.bind(this);
    this.handleJoinMicrophone = this.handleJoinMicrophone.bind(this);
    this.handleJoinLocalEcho = this.handleJoinLocalEcho.bind(this);
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
      errorInfo: null,
    });

    return this.handleGoToEchoTest();
  }

  handleGoToLocalEcho() {
    // Simplified echo test: this will return the AudioSettings with:
    //   - withEcho: true
    // Echo test will be local and done in the AudioSettings view instead of the
    // old E2E -> yes/no -> join view
    this.setState({
      content: 'settings',
    });
  }

  handleGoToEchoTest() {
    const { AudioError } = this.props;
    const { MIC_ERROR } = AudioError;
    const noSSL = !window.location.protocol.includes('https');

    if (noSSL) {
      return this.setState({
        content: 'help',
        errorInfo: {
          errCode: MIC_ERROR.NO_SSL,
          errMessage: 'NoSSL',
        },
      });
    }

    const {
      joinEchoTest,
      isConnecting,
      localEchoEnabled,
    } = this.props;

    const {
      disableActions,
    } = this.state;

    if (disableActions && isConnecting) return null;

    if (localEchoEnabled) return this.handleGoToLocalEcho();

    this.setState({
      hasError: false,
      disableActions: true,
      errorInfo: null,
    });

    return joinEchoTest().then(() => {
      this.setState({
        content: 'echoTest',
        disableActions: false,
      });
    }).catch((err) => {
      this.handleJoinAudioError(err);
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
      hasError: false,
      errorInfo: null,
    });

    return joinListenOnly().then(() => {
      this.setState({
        disableActions: false,
      });
    }).catch((err) => {
      this.handleJoinAudioError(err);
    });
  }

  handleJoinLocalEcho(inputStream) {
    const { changeInputStream } = this.props;
    // Reset the modal to a connecting state - this kind of sucks?
    // prlanzarin Apr 04 2022
    this.setState({
      content: null,
    });
    if (inputStream) changeInputStream(inputStream);
    this.handleJoinMicrophone();
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
      errorInfo: null,
    });

    joinMicrophone().then(() => {
      this.setState({
        disableActions: false,
      });
    }).catch((err) => {
      this.handleJoinAudioError(err);
    });
  }

  handleJoinAudioError(err) {
    const { type, errCode, errMessage } = err;

    switch (type) {
      case 'MEDIA_ERROR':
        this.setState({
          content: 'help',
          disableActions: false,
          errorInfo: {
            errCode,
            errMessage,
          }
        });
        break;
      case 'CONNECTION_ERROR':
      default:
        this.setState({
          disableActions: false,
          errorInfo: {
            errCode,
            errMessage: type,
          },
        });
        break;
    }
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
        <Styled.AudioOptions data-test="audioModalOptions">
          {!showMicrophone && !isMobileNative
              && (
              <>
                <Styled.AudioModalButton
                  label={intl.formatMessage(intlMessages.microphoneLabel)}
                  data-test="microphoneBtn"
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
                <Styled.AudioModalButton
                  label={intl.formatMessage(intlMessages.listenOnlyLabel)}
                  data-test="listenOnlyBtn"
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
        </Styled.AudioOptions>
        {formattedDialNum ? (
          <Styled.AudioDial
            label={dialAudioLabel}
            size="md"
            color="secondary"
            onClick={() => {
              this.setState({
                content: 'audioDial',
              });
            }}
          />
        ) : null}
        <CaptionsSelectContainer />
      </div>
    );
  }

  renderContent() {
    const {
      isEchoTest,
      intl,
    } = this.props;

    const { content } = this.state;
    const { animations } = Settings.application;

    if (this.skipAudioOptions()) {
      return (
        <Styled.Connecting role="alert">
          <span data-test={!isEchoTest ? 'establishingAudioLabel' : 'connectingToEchoTest'}>
            {intl.formatMessage(intlMessages.connecting)}
          </span>
          <Styled.ConnectingAnimation animations={animations} />
        </Styled.Connecting>
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
      localEchoEnabled,
      showVolumeMeter,
      notify,
      AudioError,
    } = this.props;
    const { MIC_ERROR } = AudioError;

    const confirmationCallback = !localEchoEnabled
      ? this.handleRetryGoToEchoTest
      : this.handleJoinLocalEcho;

    const handleGUMFailure = (error) => {
      const errCode = error?.name === 'NotAllowedError'
        ? MIC_ERROR.NO_PERMISSION
        : 0
      this.setState({
        content: 'help',
        disableActions: false,
        errorInfo: {
          errCode,
          errMessage: error?.name || 'NotAllowedError',
        },
      });
    };

    return (
      <AudioSettings
        handleBack={this.handleGoToAudioOptions}
        handleConfirmation={confirmationCallback}
        handleGUMFailure={handleGUMFailure}
        joinEchoTest={joinEchoTest}
        changeInputDevice={changeInputDevice}
        changeOutputDevice={changeOutputDevice}
        isConnecting={isConnecting}
        isConnected={isConnected}
        isEchoTest={isEchoTest}
        inputDeviceId={inputDeviceId}
        outputDeviceId={outputDeviceId}
        withVolumeMeter={showVolumeMeter}
        withEcho={localEchoEnabled}
        produceStreams={localEchoEnabled || showVolumeMeter}
        notify={notify}
      />
    );
  }

  renderHelp() {
    const { errorInfo } = this.state;
    const { AudioError, getTroubleshootingLink, isListenOnly } = this.props;

    const audioErr = {
      ...AudioError,
      code: errorInfo?.errCode,
      message: errorInfo?.errMessage,
    };

    return (
      <Help
        handleBack={this.handleGoToAudioOptions}
        audioErr={audioErr}
        isListenOnly={isListenOnly}
        troubleshootingLink={getTroubleshootingLink(errorInfo?.errCode)}
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
      closeModal,
      isIE,
      isOpen,
      priority,
      setIsOpen,
    } = this.props;

    const { content } = this.state;

    return (
      <>
        {showPermissionsOvelay ? <PermissionsOverlay closeModal={closeModal} /> : null}
        <Styled.AudioModal
          modalName="AUDIO"
          onRequestClose={closeModal}
          data-test="audioModal"
          contentLabel={intl.formatMessage(intlMessages.ariaModalTitle)}
          title={
            !this.skipAudioOptions()
              ? (
                content
                  ? intl.formatMessage(this.contents[content].title)
                  : intl.formatMessage(intlMessages.audioChoiceLabel)
              )
              : null
          }
          {...{
            setIsOpen,
            isOpen,
            priority,
          }}
        >
          {isIE ? (
            <Styled.BrowserWarning>
              <FormattedMessage
                id="app.audioModal.unsupportedBrowserLabel"
                description="Warning when someone joins with a browser that isnt supported"
                values={{
                  0: <a href="https://www.google.com/chrome/">Chrome</a>,
                  1: <a href="https://getfirefox.com">Firefox</a>,
                }}
              />
            </Styled.BrowserWarning>
          ) : null}
          <Styled.Content>
            {this.renderContent()}
          </Styled.Content>
        </Styled.AudioModal>
      </>
    );
  }
}

AudioModal.propTypes = propTypes;
AudioModal.defaultProps = defaultProps;

export default injectIntl(AudioModal);
