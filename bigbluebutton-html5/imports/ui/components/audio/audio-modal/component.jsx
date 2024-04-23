import React, { useEffect, useState } from 'react';
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
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import AudioCaptionsSelectContainer from '../audio-graphql/audio-captions/captions/component';

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
  isIE: PropTypes.bool.isRequired,
  formattedTelVoice: PropTypes.string.isRequired,
  autoplayBlocked: PropTypes.bool.isRequired,
  handleAllowAutoplay: PropTypes.func.isRequired,
  changeInputStream: PropTypes.func.isRequired,
  localEchoEnabled: PropTypes.bool.isRequired,
  showVolumeMeter: PropTypes.bool.isRequired,
  notify: PropTypes.func.isRequired,
  isRTL: PropTypes.bool.isRequired,
  priority: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  AudioError: PropTypes.shape({
    MIC_ERROR: PropTypes.number.isRequired,
    NO_SSL: PropTypes.number.isRequired,
  }).isRequired,
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

const AudioModal = (props) => {
  const [content, setContent] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [disableActions, setDisableActions] = useState(false);
  const [errCode, setErrCode] = useState(null);
  const [autoplayChecked, setAutoplayChecked] = useState(false);

  const {
    forceListenOnlyAttendee,
    joinFullAudioImmediately,
    listenOnlyMode,
    audioLocked,
    isUsingAudio,
    autoplayBlocked,
    closeModal,
    isEchoTest,
    exitAudio,
    resolve,
    leaveEchoTest,
    AudioError,
    joinEchoTest,
    isConnecting,
    localEchoEnabled,
    joinListenOnly,
    changeInputStream,
    joinMicrophone,
    intl,
    isMobileNative,
    formattedDialNum,
    isRTL,
    isConnected,
    inputDeviceId,
    outputDeviceId,
    changeInputDevice,
    changeOutputDevice,
    showVolumeMeter,
    notify,
    formattedTelVoice,
    handleAllowAutoplay,
    showPermissionsOvelay,
    isIE,
    isOpen,
    priority,
    setIsOpen,
  } = props;

  const prevAutoplayBlocked = usePreviousValue(autoplayBlocked);

  useEffect(() => {
    if (prevAutoplayBlocked && !autoplayBlocked) {
      setAutoplayChecked(true);
    }
  }, [autoplayBlocked]);

  const handleJoinMicrophoneError = (err) => {
    const { type } = err;
    switch (type) {
      case 'MEDIA_ERROR':
        setContent('help');
        setErrCode(0);
        setDisableActions(false);
        break;
      case 'CONNECTION_ERROR':
      default:
        setErrCode(0);
        setDisableActions(false);
        break;
    }
  };

  const handleGoToLocalEcho = () => {
    // Simplified echo test: this will return the AudioSettings with:
    //   - withEcho: true
    // Echo test will be local and done in the AudioSettings view instead of the
    // old E2E -> yes/no -> join view
    setContent('settings');
  };

  const handleGoToEchoTest = () => {
    const { MIC_ERROR } = AudioError;
    const noSSL = !window.location.protocol.includes('https');

    if (noSSL) {
      setContent('help');
      setErrCode(MIC_ERROR.NO_SSL);
      return null;
    }

    if (disableActions && isConnecting) return null;

    if (localEchoEnabled) return handleGoToLocalEcho();

    setHasError(false);
    setDisableActions(true);

    return joinEchoTest().then(() => {
      setContent('echoTest');
      setDisableActions(true);
    }).catch((err) => {
      handleJoinMicrophoneError(err);
    });
  };

  const handleGoToAudioOptions = () => {
    setContent(null);
    setHasError(true);
    setDisableActions(false);
  };

  const handleGoToAudioSettings = () => {
    leaveEchoTest().then(() => {
      setContent('settings');
    });
  };

  const handleRetryGoToEchoTest = () => {
    setHasError(false);
    setContent(null);

    return handleGoToEchoTest();
  };

  const handleJoinListenOnly = () => {
    if (disableActions && isConnecting) return null;

    setDisableActions(true);

    return joinListenOnly().then(() => {
      setDisableActions(false);
    }).catch((err) => {
      if (err.type === 'MEDIA_ERROR') {
        setContent('help');
      }
    });
  };

  const handleJoinMicrophone = () => {
    if (disableActions && isConnecting) return;

    setHasError(false);
    setDisableActions(true);

    joinMicrophone().then(() => {
      setDisableActions(false);
    }).catch((err) => {
      handleJoinMicrophoneError(err);
    });
  };

  const handleJoinLocalEcho = (inputStream) => {
    // Reset the modal to a connecting state - this kind of sucks?
    // prlanzarin Apr 04 2022
    setContent(null);
    if (inputStream) changeInputStream(inputStream);
    handleJoinMicrophone();
  };

  const skipAudioOptions = () => (isConnecting || (forceListenOnlyAttendee && !autoplayChecked))
    && !content
    && !hasError;

  const renderAudioOptions = () => {
    const hideMicrophone = forceListenOnlyAttendee || audioLocked;

    const arrow = isRTL ? '←' : '→';
    const dialAudioLabel = `${intl.formatMessage(intlMessages.audioDialTitle)} ${arrow}`;

    return (
      <div>
        <Styled.AudioOptions data-test="audioModalOptions">
          {!hideMicrophone && !isMobileNative && (
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
                    ? handleJoinMicrophone
                    : handleGoToEchoTest
                }
              />
              <span className="sr-only" id="mic-description">
                {intl.formatMessage(intlMessages.microphoneDesc)}
              </span>
            </>
          )}
          {listenOnlyMode && (
            <>
              <Styled.AudioModalButton
                label={intl.formatMessage(intlMessages.listenOnlyLabel)}
                data-test="listenOnlyBtn"
                aria-describedby="listenOnly-description"
                icon="listen"
                circle
                size="jumbo"
                onClick={handleJoinListenOnly}
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
              setContent('audioDial');
            }}
          />
        ) : null}
        <AudioCaptionsSelectContainer />
      </div>
    );
  };

  const renderEchoTest = () => (
    <EchoTest
      handleNo={handleGoToAudioSettings}
      handleYes={handleJoinMicrophone}
    />
  );

  const renderAudioSettings = () => {
    const confirmationCallback = !localEchoEnabled
      ? handleRetryGoToEchoTest
      : handleJoinLocalEcho;

    const handleGUMFailure = () => {
      setContent('help');
      setErrCode(0);
      setDisableActions(false);
    };

    return (
      <AudioSettings
        handleBack={handleGoToAudioOptions}
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
  };

  const renderHelp = () => {
    const audioErr = {
      ...AudioError,
      code: errCode,
    };

    return (
      <Help
        handleBack={handleGoToAudioOptions}
        audioErr={audioErr}
      />
    );
  };

  const renderAudioDial = () => (
    <AudioDial
      formattedDialNum={formattedDialNum}
      telVoice={formattedTelVoice}
      handleBack={handleGoToAudioOptions}
    />
  );

  const renderAutoplayOverlay = () => (
    <AudioAutoplayPrompt
      handleAllowAutoplay={handleAllowAutoplay}
    />
  );

  const contents = {
    echoTest: {
      title: intlMessages.echoTestTitle,
      component: renderEchoTest,
    },
    settings: {
      title: intlMessages.settingsTitle,
      component: renderAudioSettings,
    },
    help: {
      title: intlMessages.helpTitle,
      component: renderHelp,
    },
    audioDial: {
      title: intlMessages.audioDialTitle,
      component: renderAudioDial,
    },
    autoplayBlocked: {
      title: intlMessages.autoplayPromptTitle,
      component: renderAutoplayOverlay,
    },
  };

  const renderContent = () => {
    const { animations } = Settings.application;

    if (skipAudioOptions()) {
      return (
        <Styled.Connecting role="alert">
          <span data-test={!isEchoTest ? 'establishingAudioLabel' : 'connectingToEchoTest'}>
            {intl.formatMessage(intlMessages.connecting)}
          </span>
          <Styled.ConnectingAnimation animations={animations} />
        </Styled.Connecting>
      );
    }
    return content ? contents[content].component() : renderAudioOptions();
  };

  useEffect(() => {
    if (!isUsingAudio) {
      if (forceListenOnlyAttendee || audioLocked) {
        handleJoinListenOnly();
        return;
      }

      if (joinFullAudioImmediately && !listenOnlyMode) {
        handleJoinMicrophone();
        return;
      }

      if (!listenOnlyMode) {
        handleGoToEchoTest();
      }
    }
  }, []);

  useEffect(() => {
    if (autoplayBlocked) {
      setContent('autoplayBlocked');
    } else if (prevAutoplayBlocked) {
      closeModal();
    }
  }, [autoplayBlocked]);

  useEffect(() => () => {
    if (isEchoTest) {
      exitAudio();
    }
    if (resolve) resolve();
    Session.set('audioModalIsOpen', false);
  }, []);

  let title = content
    ? intl.formatMessage(contents[content].title)
    : intl.formatMessage(intlMessages.audioChoiceLabel);
  title = !skipAudioOptions() ? title : null;

  return (
    <>
      {showPermissionsOvelay ? <PermissionsOverlay closeModal={closeModal} /> : null}
      <Styled.AudioModal
        modalName="AUDIO"
        onRequestClose={closeModal}
        data-test="audioModal"
        contentLabel={intl.formatMessage(intlMessages.ariaModalTitle)}
        title={title}
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
              description="Warning when someone joins with a browser that isn't supported"
              values={{
                0: <a href="https://www.google.com/chrome/">Chrome</a>,
                1: <a href="https://getfirefox.com">Firefox</a>,
              }}
            />
          </Styled.BrowserWarning>
        ) : null}
        <Styled.Content>
          {renderContent()}
        </Styled.Content>
      </Styled.AudioModal>
    </>
  );
};

AudioModal.propTypes = propTypes;
AudioModal.defaultProps = defaultProps;

export default injectIntl(AudioModal);
