/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useReactiveVar } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import PreFlightBody, { PreFlightBodyHandle, PreFlightFooterContext } from './PreFlightBody';
import AudioService from '/imports/ui/components/audio/service';
import {
  joinListenOnly,
  joinMicrophone,
} from '/imports/ui/components/audio/audio-modal/service';
import AudioManager from '/imports/ui/services/audio-manager';
import VideoService from '/imports/ui/components/video-provider/service';
import { useIsCamSharingLocked } from '/imports/ui/components/video-provider/hooks';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const LISTEN_ONLY = 'listen-only';
// Soft hand-off before unmounting the modal (matches the CardFx transition).
const JOIN_TRANSITION_MS = 200;

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
  joiningLabel: {
    id: 'app.preFlight.joiningLabel',
    description: 'Pre-flight join button loading label',
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
    // @ts-ignore - temporary while hybrid (meteor+GraphQl)
    AudioManager._transparentListenOnlySupported.value,
  ) as boolean;
  const { data: currentUser } = useCurrentUser((u) => ({ name: u.name }));

  const bodyRef = useRef<PreFlightBodyHandle>(null);
  const [isJoining, setIsJoining] = useState(false);
  const showCamera = enableVideo && !isCamLocked;

  // Run the card fade/scale-out, then hand off to the meeting. onJoined unmounts
  // the modal, so the short delay is what makes the commit feel like a hand-off.
  const finalizeJoin = useCallback(() => {
    setIsJoining(true);
    window.setTimeout(() => onJoined(), JOIN_TRANSITION_MS);
  }, [onJoined]);

  const handleJoinMicrophone = useCallback(
    (joinMuted: boolean) => {
      bodyRef.current?.shareCamera();

      // Hand off the preview stream to the audio manager so the join flow reuses
      // it instead of firing a second getUserMedia prompt.
      const micStream = bodyRef.current?.getMicStream();
      if (micStream) {
        AudioService.changeInputStream(micStream);
        bodyRef.current?.markStreamHandedOff();
      }

      joinMicrophone({ skipEchoTest: true, muted: joinMuted }).catch(
        (error) => {
          logger.error(
            {
              logCode: 'preflight_join_microphone_failed',
              extraInfo: {
                errorName: error?.name,
                errorMessage: error?.message,
              },
            },
            'Pre-flight: join microphone failed',
          );
        },
      );
      finalizeJoin();
    },
    [finalizeJoin],
  );

  const handleJoinListenOnly = useCallback(() => {
    bodyRef.current?.shareCamera();
    joinListenOnly().catch((error) => {
      logger.error(
        {
          logCode: 'preflight_join_listen_only_failed',
          extraInfo: { errorName: error?.name, errorMessage: error?.message },
        },
        'Pre-flight: join listen only failed',
      );
    });
    finalizeJoin();
  }, [finalizeJoin]);

  const renderFooter = useCallback(
    ({ inputDeviceId, blocked, micMuted }: PreFlightFooterContext) => {
      const isListenOnlySelected = inputDeviceId === LISTEN_ONLY;
      const handleJoin = isListenOnlySelected
        ? handleJoinListenOnly
        : () => handleJoinMicrophone(micMuted);
      return (
        <Styled.Footer>
          <Styled.JoinButton
            color="primary"
            size="md"
            customIcon={isJoining ? <Styled.Spinner /> : undefined}
            label={intl.formatMessage(
              isJoining ? intlMessages.joiningLabel : intlMessages.joinLabel,
            )}
            data-test="preFlightJoinButton"
            disabled={blocked || isJoining}
            onClick={handleJoin}
          />
          {listenOnlyMode && !isListenOnlySelected && (
            <Styled.ListenOnlyLink
              type="button"
              data-test="preFlightListenOnlyButton"
              disabled={isJoining}
              onClick={handleJoinListenOnly}
            >
              {intl.formatMessage(intlMessages.listenOnlyLabel)}
            </Styled.ListenOnlyLink>
          )}
        </Styled.Footer>
      );
    },
    [
      intl,
      isJoining,
      listenOnlyMode,
      handleJoinListenOnly,
      handleJoinMicrophone,
    ],
  );

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
      <Styled.CardFx joining={isJoining}>
        <Styled.Header>
          <Styled.Title>{intl.formatMessage(intlMessages.title)}</Styled.Title>
          <Styled.Subtitle>
            {intl.formatMessage(intlMessages.subtitle)}
          </Styled.Subtitle>
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
          enableJoinControls
          shareOnJoinDefault={autoShareWebcam}
          joinMutedDefault={muted}
          userName={currentUser?.name}
          startSharing={(deviceId: string) => VideoService.joinVideo(deviceId, isCamLocked)}
          renderFooter={renderFooter}
        />
      </Styled.CardFx>
    </Styled.PreFlightModal>
  );
};

export default PreFlight;
