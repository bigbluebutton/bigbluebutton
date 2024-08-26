import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  defineMessages, injectIntl, FormattedMessage,
} from 'react-intl';
import { useMutation } from '@apollo/client';
import Styled from './styles';
import AudioSettings from '../audio-settings/component';
import EchoTest from '../echo-test/component';
import Help from '../help/component';
import AudioDial from '../audio-dial/component';
import AudioAutoplayPrompt from '../autoplay/component';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import { SET_AWAY } from '/imports/ui/components/user-list/user-list-content/user-participants/user-list-participants/user-actions/mutations';
import VideoService from '/imports/ui/components/video-provider/service';
import AudioCaptionsSelectContainer from '../audio-graphql/audio-captions/captions/component';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';
import {
  muteAway,
} from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import Session from '/imports/ui/services/storage/in-memory';
import logger from '/imports/startup/client/logger';

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
  isMuted: PropTypes.bool.isRequired,
  toggleMuteMicrophoneSystem: PropTypes.func.isRequired,
  inputDeviceId: PropTypes.string,
  outputDeviceId: PropTypes.string,
  formattedDialNum: PropTypes.string.isRequired,
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
  notify: PropTypes.func.isRequired,
  isRTL: PropTypes.bool.isRequired,
  priority: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  AudioError: PropTypes.shape({
    MIC_ERROR: PropTypes.shape({
      UNKNOWN: PropTypes.number,
      NO_SSL: PropTypes.number,
      MAC_OS_BLOCK: PropTypes.number,
      NO_PERMISSION: PropTypes.number,
      DEVICE_NOT_FOUND: PropTypes.number,
    }),
  }).isRequired,
  getTroubleshootingLink: PropTypes.func.isRequired,
  away: PropTypes.bool,
  doGUM: PropTypes.func.isRequired,
  hasMicrophonePermission: PropTypes.func.isRequired,
  permissionStatus: PropTypes.string,
  liveChangeInputDevice: PropTypes.func.isRequired,
  content: PropTypes.string,
  unmuteOnExit: PropTypes.bool,
  supportsTransparentListenOnly: PropTypes.bool.isRequired,
  getAudioConstraints: PropTypes.func.isRequired,
  isTranscriptionEnabled: PropTypes.bool.isRequired,
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
    id: 'app.audio.audioSettings.titleLabel',
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
  findingDevicesTitle: {
    id: 'app.audio.audioSettings.findingDevicesTitle',
    description: 'Message for finding audio devices',
  },
});

const AudioModal = ({
  forceListenOnlyAttendee,
  joinFullAudioImmediately = false,
  listenOnlyMode,
  audioLocked,
  isUsingAudio,
  isListenOnly,
  isMuted,
  toggleMuteMicrophoneSystem,
  autoplayBlocked,
  closeModal,
  isEchoTest,
  exitAudio,
  resolve = null,
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
  inputDeviceId = null,
  outputDeviceId = null,
  changeInputDevice,
  changeOutputDevice,
  notify,
  formattedTelVoice,
  handleAllowAutoplay,
  isIE,
  isOpen,
  priority,
  setIsOpen,
  getTroubleshootingLink,
  away = false,
  doGUM,
  getAudioConstraints,
  hasMicrophonePermission,
  liveChangeInputDevice,
  content: initialContent,
  supportsTransparentListenOnly,
  unmuteOnExit = false,
  permissionStatus = null,
  isTranscriptionEnabled,
}) => {
  const [content, setContent] = useState(initialContent);
  const [hasError, setHasError] = useState(false);
  const [disableActions, setDisableActions] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [autoplayChecked, setAutoplayChecked] = useState(false);
  const [findingDevices, setFindingDevices] = useState(false);
  const [setAway] = useMutation(SET_AWAY);
  const voiceToggle = useToggleVoice();

  const prevAutoplayBlocked = usePreviousValue(autoplayBlocked);

  useEffect(() => {
    if (prevAutoplayBlocked && !autoplayBlocked) {
      setAutoplayChecked(true);
    }
  }, [autoplayBlocked]);

  const handleJoinAudioError = (err) => {
    const { type, errCode, errMessage } = err;

    switch (type) {
      case 'MEDIA_ERROR':
        setContent('help');
        setErrorInfo({
          errCode,
          errMessage,
        });
        setDisableActions(false);
        break;
      case 'CONNECTION_ERROR':
      default:
        setErrorInfo({
          errCode,
          errMessage: type,
        });
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
      setErrorInfo({
        errCode: MIC_ERROR.NO_SSL,
        errMessage: 'NoSSL',
      });
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
      handleJoinAudioError(err);
    });
  };

  const handleGUMFailure = (error) => {
    const { MIC_ERROR } = AudioError;

    logger.error({
      logCode: 'audio_gum_failed',
      extraInfo: {
        errorMessage: error.message,
        errorName: error.name,
      },
    }, `Audio gUM failed: ${error.name}`);

    setContent('help');
    setDisableActions(false);
    setHasError(true);
    setErrorInfo({
      errCode: error?.name === 'NotAllowedError'
        ? MIC_ERROR.NO_PERMISSION
        : 0,
      errMessage: error?.name || 'NotAllowedError',
    });
  };

  const checkMicrophonePermission = (options) => {
    setFindingDevices(true);

    return hasMicrophonePermission(options)
      .then((hasPermission) => {
        // null means undetermined, so we don't want to show the error modal
        // and let downstream components figure it out
        if (hasPermission === true || hasPermission === null) {
          return hasPermission;
        }

        handleGUMFailure(new DOMException(
          'Permissions API says denied',
          'NotAllowedError',
        ));

        return false;
      })
      .catch((error) => {
        handleGUMFailure(error);
        return null;
      })
      .finally(() => {
        setFindingDevices(false);
      });
  };

  const handleGoToAudioOptions = () => {
    setContent(null);
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
    setErrorInfo(null);

    return handleGoToEchoTest();
  };

  const disableAwayMode = () => {
    if (!away) return;

    muteAway(false, true, voiceToggle);
    setAway({
      variables: {
        away: false,
      },
    });
    VideoService.setTrackEnabled(true);
  };

  const handleJoinListenOnly = () => {
    if (disableActions && isConnecting) return null;

    setDisableActions(true);
    setHasError(false);
    setErrorInfo(null);

    return joinListenOnly().then(() => {
      setDisableActions(false);
      disableAwayMode();
    }).catch((err) => {
      handleJoinAudioError(err);
    });
  };

  const handleJoinMicrophone = () => {
    if (disableActions && isConnecting) return;

    setHasError(false);
    setDisableActions(true);
    setErrorInfo(null);

    joinMicrophone().then(() => {
      setDisableActions(false);
    }).catch((err) => {
      handleJoinAudioError(err);
    });
  };

  const handleAudioSettingsConfirmation = useCallback((inputStream) => {
    // Reset the modal to a connecting state - this kind of sucks?
    // prlanzarin Apr 04 2022
    setContent(null);
    if (inputStream) changeInputStream(inputStream);

    if (!isConnected) {
      handleJoinMicrophone();
      disableAwayMode();
    } else {
      closeModal();
    }
  }, [changeInputStream, isConnected]);

  const skipAudioOptions = useCallback(
    // eslint-disable-next-line max-len
    () => !hasError && (isConnecting || (forceListenOnlyAttendee && !autoplayChecked) || !listenOnlyMode),
    [hasError, isConnecting, forceListenOnlyAttendee, autoplayChecked, listenOnlyMode],
  );

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
        {joinFullAudioImmediately && <AudioCaptionsSelectContainer />}
      </div>
    );
  };

  const renderEchoTest = () => (
    <EchoTest
      handleNo={handleGoToAudioSettings}
      handleYes={handleJoinMicrophone}
    />
  );

  const handleBack = useCallback(() => {
    // If audio is active, audio options are flagged to be skipped (see skipAudioOptions)
    // or listen only mode is deactivated (which means there are no actual options
    // in the base modal), clicking back on any of the sub-modals should close the base modal
    if (isConnecting
      || isConnected
      || skipAudioOptions()) {
      closeModal();
    } else {
      handleGoToAudioOptions();
    }
  }, [isConnecting, isConnected, skipAudioOptions, listenOnlyMode]);

  const renderAudioSettings = () => {
    const { animations } = getSettingsSingletonInstance().application;
    const confirmationCallback = !localEchoEnabled
      ? handleRetryGoToEchoTest
      : handleAudioSettingsConfirmation;

    return (
      <AudioSettings
        animations={animations}
        handleBack={handleBack}
        handleConfirmation={confirmationCallback}
        handleGUMFailure={handleGUMFailure}
        joinEchoTest={joinEchoTest}
        changeInputDevice={changeInputDevice}
        liveChangeInputDevice={liveChangeInputDevice}
        changeOutputDevice={changeOutputDevice}
        isConnecting={isConnecting}
        isConnected={isConnected}
        isMuted={isMuted}
        toggleMuteMicrophoneSystem={toggleMuteMicrophoneSystem}
        inputDeviceId={inputDeviceId}
        outputDeviceId={outputDeviceId}
        withEcho={localEchoEnabled}
        produceStreams
        notify={notify}
        unmuteOnExit={unmuteOnExit}
        doGUM={doGUM}
        getAudioConstraints={getAudioConstraints}
        checkMicrophonePermission={checkMicrophonePermission}
        supportsTransparentListenOnly={supportsTransparentListenOnly}
        toggleVoice={voiceToggle}
        permissionStatus={permissionStatus}
        isTranscriptionEnabled={isTranscriptionEnabled}
        skipAudioOptions={skipAudioOptions}
      />
    );
  };

  const renderHelp = () => {
    const audioErr = {
      ...AudioError,
      code: errorInfo?.errCode,
      message: errorInfo?.errMessage,
    };

    const _joinListenOnly = () => {
      // Erase the content state so that the modal transitions to the connecting
      // state if the user chooses listen only
      setContent(null);
      handleJoinListenOnly();
    };

    return (
      <Help
        isConnected={isConnected}
        handleBack={handleBack}
        handleJoinListenOnly={_joinListenOnly}
        handleRetryMic={handleGoToAudioSettings}
        audioErr={audioErr}
        isListenOnly={isListenOnly}
        troubleshootingLink={getTroubleshootingLink(errorInfo?.errCode)}
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
    const { animations } = getSettingsSingletonInstance().application;

    if (content == null) {
      if (findingDevices) {
        return (
          <Styled.Connecting role="alert">
            <span data-test="findingDevicesLabel">
              {intl.formatMessage(intlMessages.findingDevicesTitle)}
            </span>
            <Styled.ConnectingAnimation animations={animations} />
          </Styled.Connecting>
        );
      }

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
    }

    return content ? contents[content].component() : renderAudioOptions();
  };

  useEffect(() => {
    if (!isUsingAudio) {
      if (forceListenOnlyAttendee || audioLocked) {
        handleJoinListenOnly();
      } else if (!listenOnlyMode) {
        if (joinFullAudioImmediately) {
          checkMicrophonePermission({ doGUM: true, permissionStatus })
            .then((hasPermission) => {
              // No permission - let the Help screen be shown as it's triggered
              // by the checkMicrophonePermission function
              if (hasPermission === false) return;

              // Permission is granted or undetermined, so we can proceed
              handleJoinMicrophone();
            });
        } else {
          checkMicrophonePermission({ doGUM: false, permissionStatus }).then((hasPermission) => {
            if (hasPermission === false) return;
            handleGoToEchoTest();
          });
        }
      }
    }
  }, [
    audioLocked,
    isUsingAudio,
    forceListenOnlyAttendee,
    joinFullAudioImmediately,
    listenOnlyMode,
  ]);

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
    Session.setItem('audioModalIsOpen', false);
  }, []);

  let title = content
    ? intl.formatMessage(contents[content].title)
    : intl.formatMessage(intlMessages.audioChoiceLabel);
  title = (!skipAudioOptions() && !findingDevices) || content
    ? title
    : null;

  return (
    <Styled.Background isBlurred={Session.getItem('audioModalIsOpen')}>
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
    </Styled.Background>
  );
};

AudioModal.propTypes = propTypes;

export default injectIntl(AudioModal);
