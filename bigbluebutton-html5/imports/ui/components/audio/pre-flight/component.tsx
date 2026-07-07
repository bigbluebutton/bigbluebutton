import React, { useCallback, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useReactiveVar } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import PreFlightBody, { PreFlightBodyHandle } from './PreFlightBody';
import AudioService from '/imports/ui/components/audio/service';
import { joinListenOnly, joinMicrophone } from '/imports/ui/components/audio/audio-modal/service';
import AudioManager from '/imports/ui/services/audio-manager';
import VideoService from '/imports/ui/components/video-provider/service';
import { useIsCamSharingLocked } from '/imports/ui/components/video-provider/hooks';

const LISTEN_ONLY = 'listen-only';

const intlMessages = defineMessages({
  title: {
    id: 'app.preFlight.title',
    description: 'Pre-flight screen title',
  },
  subtitle: {
    id: 'app.preFlight.subtitle',
    description: 'Pre-flight screen subtitle',
  },
  ariaTitle: {
    id: 'app.preFlight.ariaTitle',
    description: 'Pre-flight screen aria title',
  },
  joinLabel: {
    id: 'app.preFlight.joinLabel',
    description: 'Pre-flight join button label',
  },
  listenOnlyLabel: {
    id: 'app.preFlight.listenOnlyLabel',
    description: 'Pre-flight join without microphone (listen only) label',
  },
});

interface PreFlightProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  priority: string;
  onJoined: () => void;
  muted: boolean;
  localEchoEnabled: boolean;
  listenOnlyMode: boolean;
  micDisabled: boolean;
  enableVideo: boolean;
  autoShareWebcam: boolean;
}

const PreFlight: React.FC<PreFlightProps> = ({
  isOpen,
  setIsOpen,
  priority,
  onJoined,
  muted,
  localEchoEnabled,
  listenOnlyMode,
  micDisabled,
  enableVideo,
  autoShareWebcam,
}) => {
  const intl = useIntl();
  const isCamLocked = useIsCamSharingLocked();
  const supportsTransparentListenOnly = useReactiveVar(
    AudioManager._transparentListenOnlySupported.value,
  ) as boolean;

  const bodyRef = useRef<PreFlightBodyHandle>(null);
  const showCamera = enableVideo && !isCamLocked;

  const handleJoinMicrophone = useCallback(() => {
    bodyRef.current?.shareCamera();

    // Hand off the preview stream to the audio manager so the join flow reuses
    // it instead of firing a second getUserMedia prompt.
    const micStream = bodyRef.current?.getMicStream();
    if (micStream) {
      AudioService.changeInputStream(micStream);
      bodyRef.current?.markStreamHandedOff();
    }

    joinMicrophone({ skipEchoTest: true, muted }).catch((error) => {
      logger.error({
        logCode: 'preflight_join_microphone_failed',
        extraInfo: { errorName: error?.name, errorMessage: error?.message },
      }, 'Pre-flight: join microphone failed');
    });
    onJoined();
  }, [muted, onJoined]);

  const handleJoinListenOnly = useCallback(() => {
    bodyRef.current?.shareCamera();
    joinListenOnly().catch((error) => {
      logger.error({
        logCode: 'preflight_join_listen_only_failed',
        extraInfo: { errorName: error?.name, errorMessage: error?.message },
      }, 'Pre-flight: join listen only failed');
    });
    onJoined();
  }, [onJoined]);

  const renderFooter = useCallback(({ inputDeviceId, blocked }: { inputDeviceId: string; blocked: boolean }) => {
    const isListenOnlySelected = inputDeviceId === LISTEN_ONLY;
    const handleJoin = isListenOnlySelected ? handleJoinListenOnly : handleJoinMicrophone;
    return (
      <Styled.Footer>
        <Styled.JoinButton
          color="primary"
          size="md"
          label={intl.formatMessage(intlMessages.joinLabel)}
          data-test="preFlightJoinButton"
          disabled={blocked}
          onClick={handleJoin}
        />
        {listenOnlyMode && !isListenOnlySelected && (
          <Styled.ListenOnlyLink
            type="button"
            data-test="preFlightListenOnlyButton"
            onClick={handleJoinListenOnly}
          >
            {intl.formatMessage(intlMessages.listenOnlyLabel)}
          </Styled.ListenOnlyLink>
        )}
      </Styled.Footer>
    );
  }, [intl, listenOnlyMode, handleJoinListenOnly, handleJoinMicrophone]);

  return (
    <Styled.PreFlightModal
      modalName="PRE_FLIGHT"
      onRequestClose={() => setIsOpen(false)}
      data-test="preFlightModal"
      contentLabel={intl.formatMessage(intlMessages.ariaTitle)}
      title=""
      {...{
        setIsOpen,
        isOpen,
        priority,
        modalIsOpen: isOpen,
      }}
    >
      <Styled.Header>
        <Styled.Title>{intl.formatMessage(intlMessages.title)}</Styled.Title>
        <Styled.Subtitle>{intl.formatMessage(intlMessages.subtitle)}</Styled.Subtitle>
      </Styled.Header>
      <PreFlightBody
        ref={bodyRef}
        useAudioManager
        persistDevices={false}
        micDisabled={micDisabled}
        showCamera={showCamera}
        isCamLocked={isCamLocked}
        supportsTransparentListenOnly={supportsTransparentListenOnly}
        localEchoEnabled={localEchoEnabled}
        enableCameraShareToggle
        shareOnJoinDefault={autoShareWebcam}
        startSharing={(deviceId: string) => VideoService.joinVideo(deviceId, isCamLocked)}
        renderFooter={renderFooter}
      />
    </Styled.PreFlightModal>
  );
};

export default PreFlight;
