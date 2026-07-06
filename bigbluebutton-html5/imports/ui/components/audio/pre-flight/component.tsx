import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useReactiveVar } from '@apollo/client';
import { MenuItem, SelectChangeEvent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import AudioService from '/imports/ui/components/audio/service';
import { joinListenOnly, joinMicrophone } from '/imports/ui/components/audio/audio-modal/service';
import AudioManager from '/imports/ui/services/audio-manager';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import { destroyWasmProcessor } from '/imports/ui/components/audio/audio-processor/service';
import { notify } from '/imports/ui/services/notification';
import DeviceSelector from '/imports/ui/components/audio/device-selector/component';
import AudioStreamVolume from '/imports/ui/components/audio/audio-stream-volume/component';
import LocalEchoContainer from '/imports/ui/components/audio/local-echo/container';
import AudioTestContainer from '/imports/ui/components/audio/audio-test/container';
import { useVideoPreview } from '/imports/ui/components/video-preview/hooks/useVideoPreview';
import PreviewService from '/imports/ui/components/video-preview/service';
import VideoService from '/imports/ui/components/video-provider/service';
import { useIsCamSharingLocked } from '/imports/ui/components/video-provider/hooks';
import { useStorageKey } from '/imports/ui/services/storage/hooks';

const LISTEN_ONLY = 'listen-only';

const intlMessages = defineMessages({
  title: {
    id: 'app.preFlight.title',
    description: 'Pre-flight screen title',
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
  shareCameraLabel: {
    id: 'app.preFlight.shareCameraLabel',
    description: 'Pre-flight join with camera toggle label',
  },
  cameraLockedLabel: {
    id: 'app.preFlight.cameraLockedLabel',
    description: 'Pre-flight camera locked label',
  },
  findingDevicesLabel: {
    id: 'app.preFlight.findingDevicesLabel',
    description: 'Pre-flight finding devices label',
  },
  microphoneLabel: {
    id: 'app.audio.audioSettings.microphoneSourceLabel',
    description: 'Microphone source label',
  },
  speakerLabel: {
    id: 'app.audio.audioSettings.speakerSourceLabel',
    description: 'Speaker source label',
  },
  cameraLabel: {
    id: 'app.videoPreview.cameraLabel',
    description: 'Camera dropdown label',
  },
  webcamNotFoundLabel: {
    id: 'app.videoPreview.webcamNotFoundLabel',
    description: 'Webcam not found label',
  },
  testSpeakerLabel: {
    id: 'app.audio.audioSettings.testSpeakerLabel',
    description: 'Speaker test label',
  },
  deviceChangeFailed: {
    id: 'app.audioNotification.deviceChangeFailed',
    description: 'Device change failed notification',
  },
});

interface CameraPreviewHandle {
  share: () => void;
}

interface CameraPreviewProps {
  autoShareWebcam: boolean;
}

const CameraPreview = forwardRef<CameraPreviewHandle, CameraPreviewProps>(
  ({ autoShareWebcam }, ref) => {
    const intl = useIntl();
    const isCamLocked = useIsCamSharingLocked();
    // @ts-ignore - userSettingsStorage is a runtime config
    const settingsStorage = window.meetingClientSettings.public.app.userSettingsStorage;
    const lastWebcamDeviceId = (useStorageKey('WebcamDeviceId', settingsStorage) as string) || null;
    const [shareOnJoin, setShareOnJoin] = useState(autoShareWebcam);

    const {
      availableWebcams,
      webcamDeviceId,
      viewState,
      deviceError,
      previewError,
      videoRef,
      currentVideoStream,
      handleSelectWebcam,
      handleStartSharing,
      VIEW_STATES,
    } = useVideoPreview({
      initialDeviceId: lastWebcamDeviceId,
      initialProfileId: PreviewService.getDefaultProfile().id,
      forceOpen: true,
      startSharing: (deviceId: string) => VideoService.joinVideo(deviceId, isCamLocked),
    });

    useImperativeHandle(ref, () => ({
      share: () => {
        if (shareOnJoin && webcamDeviceId && currentVideoStream.current) {
          handleStartSharing(webcamDeviceId);
        }
      },
    }), [shareOnJoin, webcamDeviceId, handleStartSharing]);

    const renderPreview = () => {
      if (viewState === VIEW_STATES.error) {
        return <Styled.PlaceholderText>{deviceError}</Styled.PlaceholderText>;
      }
      if (viewState === VIEW_STATES.finding) {
        return <Styled.PlaceholderText>{intl.formatMessage(intlMessages.findingDevicesLabel)}</Styled.PlaceholderText>;
      }
      if (previewError) {
        return <Styled.PlaceholderText>{previewError}</Styled.PlaceholderText>;
      }
      return (
        <Styled.VideoPreview
          mirrored={VideoService.mirrorOwnWebcam()}
          data-test="preFlightVideoPreview"
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
      );
    };

    return (
      <Styled.CameraColumn>
        <Styled.VideoWrapper>
          {renderPreview()}
        </Styled.VideoWrapper>
        <Styled.DeviceGroup>
          {intl.formatMessage(intlMessages.cameraLabel)}
          {availableWebcams && availableWebcams.length > 0 ? (
            <Styled.CameraSelect
              value={webcamDeviceId || ''}
              onChange={(e: SelectChangeEvent<unknown>) => handleSelectWebcam(
                e as unknown as React.ChangeEvent<HTMLSelectElement>,
              )}
              IconComponent={ExpandMoreIcon}
              SelectDisplayProps={{ 'data-test': 'preFlightCameraSelect' } as React.HTMLAttributes<HTMLDivElement>}
            >
              {availableWebcams.map((webcam, index) => (
                <MenuItem key={webcam.deviceId} value={webcam.deviceId}>
                  {webcam.label || `${intl.formatMessage(intlMessages.cameraLabel)} ${index + 1}`}
                </MenuItem>
              ))}
            </Styled.CameraSelect>
          ) : (
            <span>{intl.formatMessage(intlMessages.webcamNotFoundLabel)}</span>
          )}
        </Styled.DeviceGroup>
        <Styled.CameraToggle>
          <input
            type="checkbox"
            checked={shareOnJoin}
            data-test="preFlightShareCameraToggle"
            onChange={(e) => setShareOnJoin(e.target.checked)}
          />
          {intl.formatMessage(intlMessages.shareCameraLabel)}
        </Styled.CameraToggle>
      </Styled.CameraColumn>
    );
  },
);

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

  const inputDeviceId = useReactiveVar(AudioManager._inputDeviceId.value) as string;
  const outputDeviceId = useReactiveVar(AudioManager._outputDeviceId.value) as string;
  const permissionStatus = useReactiveVar(AudioManager._permissionStatus.value) as string;
  const supportsTransparentListenOnly = useReactiveVar(
    AudioManager._transparentListenOnlySupported.value,
  ) as boolean;

  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [producingStream, setProducingStream] = useState(false);
  const [findingDevices, setFindingDevices] = useState(true);

  const isMounted = useRef(true);
  const micStreamRef = useRef<MediaStream | null>(null);
  const streamHandedOff = useRef(false);
  const cameraRef = useRef<CameraPreviewHandle>(null);

  const showCamera = enableVideo && !isCamLocked;

  const cleanupMicStream = useCallback(() => {
    if (micStreamRef.current && !streamHandedOff.current) {
      destroyWasmProcessor(micStreamRef.current);
      MediaStreamUtils.stopMediaStreamTracks(micStreamRef.current);
    }
    micStreamRef.current = null;
  }, []);

  const updateDeviceList = useCallback(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputs = devices.filter((d) => d.kind === 'audioinput');
    const outputs = devices.filter((d) => d.kind === 'audiooutput');
    AudioService.updateInputDevices(inputs);
    AudioService.updateOutputDevices(outputs);
    if (!isMounted.current) return;
    setAudioInputDevices(inputs);
    setAudioOutputDevices(outputs);
  }, []);

  const generateInputStream = useCallback(async (deviceId: string) => {
    // Stop any previous preview stream before requesting a new one.
    cleanupMicStream();

    if (deviceId === LISTEN_ONLY) return null;

    const constraints = { audio: AudioService.getAudioConstraints({ deviceId }) };
    // Preview stream - do not promote its processor as the primary one.
    return AudioService.doGUM(constraints, { retryOnFailure: true, adoptProcessorAsPrimary: false });
  }, [cleanupMicStream]);

  const setInputDevice = useCallback(async (deviceId: string) => {
    AudioService.changeInputDevice(deviceId);

    if (deviceId === LISTEN_ONLY) {
      cleanupMicStream();
      setMicStream(null);
      return;
    }

    setProducingStream(true);
    try {
      const stream = await generateInputStream(deviceId);
      let resolvedDeviceId = deviceId;

      if (stream) {
        resolvedDeviceId = MediaStreamUtils.extractDeviceIdFromStream(stream, 'audio');
        if (resolvedDeviceId && resolvedDeviceId !== deviceId) {
          AudioService.changeInputDevice(resolvedDeviceId);
        }
      }

      if (!isMounted.current) {
        if (stream) MediaStreamUtils.stopMediaStreamTracks(stream);
        return;
      }

      micStreamRef.current = stream;
      setMicStream(stream);
      await updateDeviceList();
    } catch (error) {
      logger.warn({
        logCode: 'preflight_input_gum_failed',
        extraInfo: {
          errorName: (error as Error & { name: string })?.name,
          errorMessage: (error as Error)?.message,
        },
      }, 'Pre-flight: failed to acquire microphone. Falling back to listen only.');
      // Graceful mic-permission-denied handling: keep the user in a listen-only
      // capable state instead of blocking the pre-flight screen.
      AudioService.changeInputDevice(LISTEN_ONLY);
      if (isMounted.current) setMicStream(null);
    } finally {
      if (isMounted.current) setProducingStream(false);
    }
  }, [cleanupMicStream, generateInputStream, updateDeviceList]);

  const setOutputDevice = useCallback(async (deviceId: string) => {
    try {
      await AudioService.changeOutputDevice(deviceId, false);
    } catch (error) {
      logger.warn({
        logCode: 'preflight_output_device_change_failed',
        extraInfo: {
          errorName: (error as Error & { name: string })?.name,
          errorMessage: (error as Error)?.message,
        },
      }, 'Pre-flight: failed to change output device');
      notify(intl.formatMessage(intlMessages.deviceChangeFailed), 'error');
    }
  }, [intl]);

  useEffect(() => {
    isMounted.current = true;
    setFindingDevices(true);

    // When the microphone is disabled (force listen only / mic locked) we must
    // not prompt for microphone access - only enumerate output devices.
    if (micDisabled) {
      AudioService.changeInputDevice(LISTEN_ONLY);
      updateDeviceList()
        .then(() => {
          if (!isMounted.current) return;
          setFindingDevices(false);
          setOutputDevice(outputDeviceId || '');
        })
        .catch(() => {
          if (isMounted.current) setFindingDevices(false);
        });
    } else {
      AudioService.hasMicrophonePermission({ gumOnPrompt: true, permissionStatus })
        .then(() => updateDeviceList())
        .then(() => {
          if (!isMounted.current) return undefined;
          setFindingDevices(false);
          return setInputDevice(inputDeviceId || '');
        })
        .then(() => {
          if (isMounted.current) setOutputDevice(outputDeviceId || '');
        })
        .catch(() => {
          if (isMounted.current) setFindingDevices(false);
        });
    }

    return () => {
      isMounted.current = false;
      cleanupMicStream();
    };
    // Run once on mount - device init.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shareCameraIfEnabled = useCallback(() => {
    if (showCamera) cameraRef.current?.share();
  }, [showCamera]);

  const handleJoinMicrophone = useCallback(() => {
    shareCameraIfEnabled();

    // Hand off the preview stream to the audio manager so the join flow reuses
    // it instead of firing a second getUserMedia prompt.
    if (micStreamRef.current) {
      AudioService.changeInputStream(micStreamRef.current);
      streamHandedOff.current = true;
    }

    joinMicrophone({ skipEchoTest: true, muted }).catch((error) => {
      logger.error({
        logCode: 'preflight_join_microphone_failed',
        extraInfo: { errorName: error?.name, errorMessage: error?.message },
      }, 'Pre-flight: join microphone failed');
    });
    onJoined();
  }, [muted, onJoined, shareCameraIfEnabled]);

  const handleJoinListenOnly = useCallback(() => {
    shareCameraIfEnabled();
    joinListenOnly().catch((error) => {
      logger.error({
        logCode: 'preflight_join_listen_only_failed',
        extraInfo: { errorName: error?.name, errorMessage: error?.message },
      }, 'Pre-flight: join listen only failed');
    });
    onJoined();
  }, [onJoined, shareCameraIfEnabled]);

  const isListenOnlySelected = inputDeviceId === LISTEN_ONLY;
  const handleJoin = isListenOnlySelected ? handleJoinListenOnly : handleJoinMicrophone;
  const blocked = findingDevices || producingStream;

  return (
    <Styled.PreFlightModal
      modalName="PRE_FLIGHT"
      onRequestClose={() => setIsOpen(false)}
      data-test="preFlightModal"
      contentLabel={intl.formatMessage(intlMessages.ariaTitle)}
      title={intl.formatMessage(intlMessages.title)}
      {...{
        setIsOpen,
        isOpen,
        priority,
        modalIsOpen: isOpen,
      }}
    >
      <Styled.Content>
        {showCamera && <CameraPreview ref={cameraRef} autoShareWebcam={autoShareWebcam} />}
        {enableVideo && isCamLocked && (
          <Styled.LockedNote>{intl.formatMessage(intlMessages.cameraLockedLabel)}</Styled.LockedNote>
        )}
        <Styled.DevicesColumn>
          {!micDisabled && (
            <>
              <Styled.DeviceGroup htmlFor="preFlightInputDeviceSelector">
                {intl.formatMessage(intlMessages.microphoneLabel)}
                <DeviceSelector
                  deviceId={inputDeviceId || ''}
                  devices={audioInputDevices}
                  kind="audioinput"
                  blocked={blocked}
                  onChange={setInputDevice}
                  intl={intl}
                  supportsTransparentListenOnly={supportsTransparentListenOnly}
                />
              </Styled.DeviceGroup>
              <Styled.StreamVolumeWrapper>
                <AudioStreamVolume stream={micStream} />
              </Styled.StreamVolumeWrapper>
            </>
          )}
          <Styled.DeviceGroup htmlFor="preFlightOutputDeviceSelector">
            {intl.formatMessage(intlMessages.speakerLabel)}
            <DeviceSelector
              deviceId={outputDeviceId || ''}
              devices={audioOutputDevices}
              kind="audiooutput"
              blocked={blocked}
              onChange={setOutputDevice}
              intl={intl}
              supportsTransparentListenOnly={supportsTransparentListenOnly}
            />
          </Styled.DeviceGroup>
          <Styled.DeviceGroup as="div">
            {intl.formatMessage(intlMessages.testSpeakerLabel)}
            {localEchoEnabled ? (
              <LocalEchoContainer
                intl={intl}
                outputDeviceId={outputDeviceId}
                stream={micStream}
              />
            ) : (
              <AudioTestContainer />
            )}
          </Styled.DeviceGroup>
        </Styled.DevicesColumn>
      </Styled.Content>
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
    </Styled.PreFlightModal>
  );
};

CameraPreview.displayName = 'PreFlightCameraPreview';

export default PreFlight;
