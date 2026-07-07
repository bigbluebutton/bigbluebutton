import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { MenuItem, SelectChangeEvent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import AudioService from '/imports/ui/components/audio/service';
import {
  storeAudioInputDeviceId,
  storeAudioOutputDeviceId,
  getStoredAudioInputDeviceId,
  getStoredAudioOutputDeviceId,
} from '/imports/api/audio/client/bridge/service';
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

const LISTEN_ONLY = 'listen-only';

const intlMessages = defineMessages({
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
  permissionDeniedLabel: {
    id: 'app.preFlight.permissionDeniedLabel',
    description: 'Pre-flight microphone permission denied label',
  },
  tryAgainLabel: {
    id: 'app.preFlight.tryAgainLabel',
    description: 'Pre-flight retry permission button label',
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

export interface PreFlightBodyHandle {
  getMicStream: () => MediaStream | null;
  markStreamHandedOff: () => void;
  shareCamera: () => void;
  releaseStreams: () => void;
}

interface PreFlightBodyProps {
  // When true, device selections are reflected into the AudioManager (post
  // admission). When false, the body stays bridge-free (guest waiting room).
  useAudioManager: boolean;
  // When true, the chosen device ids are stored so a later mount reuses them.
  persistDevices: boolean;
  micDisabled: boolean;
  showCamera: boolean;
  isCamLocked: boolean;
  supportsTransparentListenOnly: boolean;
  localEchoEnabled: boolean;
  // Post-admission only: renders the "join with camera" toggle and lets the
  // parent trigger the actual share through the ref.
  enableCameraShareToggle: boolean;
  shareOnJoinDefault: boolean;
  // Video share function, injected by the post-admission wrapper. Absent in the
  // guest waiting room so this component never imports the join/share path.
  startSharing?: (deviceId: string) => void;
  renderFooter: (ctx: { inputDeviceId: string; blocked: boolean }) => React.ReactNode;
}

const PreFlightBody = forwardRef<PreFlightBodyHandle, PreFlightBodyProps>((props, ref) => {
  const {
    useAudioManager,
    persistDevices,
    micDisabled,
    showCamera,
    isCamLocked,
    supportsTransparentListenOnly,
    localEchoEnabled,
    enableCameraShareToggle,
    shareOnJoinDefault,
    startSharing,
    renderFooter,
  } = props;

  const intl = useIntl();

  const initialInput = useAudioManager
    ? (AudioManager.inputDeviceId || '')
    : (getStoredAudioInputDeviceId() || '');
  const initialOutput = useAudioManager
    ? (AudioManager.outputDeviceId || '')
    : (getStoredAudioOutputDeviceId() || '');
  const permissionStatus = useAudioManager
    ? (AudioManager._permissionStatus.value() as string)
    : null;

  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [inputDeviceId, setInputDeviceId] = useState<string>(micDisabled ? LISTEN_ONLY : initialInput);
  const [outputDeviceId, setOutputDeviceId] = useState<string>(initialOutput);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [producingStream, setProducingStream] = useState(false);
  const [findingDevices, setFindingDevices] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [shareOnJoin, setShareOnJoin] = useState(shareOnJoinDefault);

  const isMounted = useRef(true);
  const micStreamRef = useRef<MediaStream | null>(null);
  const streamHandedOff = useRef(false);

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
    terminateCameraStream,
    cleanupStreamAndVideo,
    VIEW_STATES,
  } = useVideoPreview({
    initialDeviceId: (PreviewService.webcamDeviceId?.() ?? null),
    initialProfileId: PreviewService.getDefaultProfile().id,
    forceOpen: true,
    startSharing,
  });

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
    if (useAudioManager) {
      AudioService.updateInputDevices(inputs);
      AudioService.updateOutputDevices(outputs);
    }
    if (!isMounted.current) return;
    setAudioInputDevices(inputs);
    setAudioOutputDevices(outputs);
  }, [useAudioManager]);

  const generateInputStream = useCallback(async (deviceId: string) => {
    cleanupMicStream();
    if (deviceId === LISTEN_ONLY) return null;
    const constraints = { audio: AudioService.getAudioConstraints({ deviceId }) };
    // Preview stream - do not promote its processor as the primary one.
    return AudioService.doGUM(constraints, { retryOnFailure: true, adoptProcessorAsPrimary: false });
  }, [cleanupMicStream]);

  const applyInputSelection = useCallback((deviceId: string) => {
    setInputDeviceId(deviceId);
    if (useAudioManager) AudioService.changeInputDevice(deviceId);
    if (persistDevices) storeAudioInputDeviceId(deviceId);
  }, [useAudioManager, persistDevices]);

  const setInputDevice = useCallback(async (deviceId: string) => {
    setPermissionDenied(false);
    applyInputSelection(deviceId);

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
          applyInputSelection(resolvedDeviceId);
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
      }, 'Pre-flight: failed to acquire microphone.');
      // Explicit permission-denied state (does not silently swallow the error):
      // the audio column shows a retry affordance while listen only stays
      // available via the footer.
      if (isMounted.current) {
        setPermissionDenied(true);
        setMicStream(null);
      }
      applyInputSelection(LISTEN_ONLY);
    } finally {
      if (isMounted.current) setProducingStream(false);
    }
  }, [applyInputSelection, cleanupMicStream, generateInputStream, updateDeviceList]);

  const setOutputDevice = useCallback(async (deviceId: string) => {
    setOutputDeviceId(deviceId);
    if (persistDevices) storeAudioOutputDeviceId(deviceId);
    if (!useAudioManager) return;
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
  }, [intl, persistDevices, useAudioManager]);

  const initDevices = useCallback(() => {
    setFindingDevices(true);
    if (micDisabled) {
      applyInputSelection(LISTEN_ONLY);
      updateDeviceList()
        .then(() => {
          if (!isMounted.current) return;
          setFindingDevices(false);
          setOutputDevice(outputDeviceId || '');
        })
        .catch(() => { if (isMounted.current) setFindingDevices(false); });
      return;
    }
    AudioService.hasMicrophonePermission({ gumOnPrompt: true, permissionStatus })
      .then(() => updateDeviceList())
      .then(() => {
        if (!isMounted.current) return undefined;
        setFindingDevices(false);
        return setInputDevice(initialInput || '');
      })
      .then(() => { if (isMounted.current) setOutputDevice(outputDeviceId || ''); })
      .catch(() => { if (isMounted.current) setFindingDevices(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micDisabled]);

  useEffect(() => {
    isMounted.current = true;
    initDevices();
    return () => {
      isMounted.current = false;
      cleanupMicStream();
    };
    // Run once on mount - device init.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectWebcam = useCallback((e: SelectChangeEvent<unknown>) => {
    handleSelectWebcam(e as unknown as React.ChangeEvent<HTMLSelectElement>);
    if (persistDevices) PreviewService.changeWebcam(e.target.value as string);
  }, [handleSelectWebcam, persistDevices]);

  useImperativeHandle(ref, () => ({
    getMicStream: () => micStreamRef.current,
    markStreamHandedOff: () => { streamHandedOff.current = true; },
    shareCamera: () => {
      if (enableCameraShareToggle && shareOnJoin && webcamDeviceId && currentVideoStream.current) {
        handleStartSharing(webcamDeviceId);
      }
    },
    releaseStreams: () => {
      cleanupMicStream();
      setMicStream(null);
      terminateCameraStream(currentVideoStream.current, webcamDeviceId);
      cleanupStreamAndVideo();
    },
  }), [
    enableCameraShareToggle, shareOnJoin, webcamDeviceId, handleStartSharing,
    cleanupMicStream, terminateCameraStream, currentVideoStream, cleanupStreamAndVideo,
  ]);

  const blocked = findingDevices || producingStream;

  const renderVideoPreview = () => {
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

  const renderCameraColumn = () => {
    if (!showCamera) {
      if (isCamLocked) {
        return <Styled.LockedNote>{intl.formatMessage(intlMessages.cameraLockedLabel)}</Styled.LockedNote>;
      }
      return null;
    }
    return (
      <Styled.CameraColumn>
        <Styled.VideoWrapper>{renderVideoPreview()}</Styled.VideoWrapper>
        <Styled.DeviceGroup>
          {intl.formatMessage(intlMessages.cameraLabel)}
          {availableWebcams && availableWebcams.length > 0 ? (
            <Styled.CameraSelect
              value={webcamDeviceId || ''}
              onChange={onSelectWebcam}
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
        {enableCameraShareToggle && (
          <Styled.CameraToggle>
            <Styled.ToggleInput
              type="checkbox"
              checked={shareOnJoin}
              data-test="preFlightShareCameraToggle"
              onChange={(e) => setShareOnJoin(e.target.checked)}
            />
            {intl.formatMessage(intlMessages.shareCameraLabel)}
          </Styled.CameraToggle>
        )}
      </Styled.CameraColumn>
    );
  };

  const renderMicSection = () => {
    if (micDisabled) return null;
    if (permissionDenied) {
      return (
        <Styled.PermissionDenied role="alert" data-test="preFlightPermissionDenied">
          <Styled.PermissionIcon iconName="warning" />
          <span>{intl.formatMessage(intlMessages.permissionDeniedLabel)}</span>
          <Styled.RetryButton
            type="button"
            data-test="preFlightRetryPermission"
            onClick={() => setInputDevice('')}
          >
            {intl.formatMessage(intlMessages.tryAgainLabel)}
          </Styled.RetryButton>
        </Styled.PermissionDenied>
      );
    }
    return (
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
    );
  };

  return (
    <>
      <Styled.Content aria-busy={blocked}>
        {renderCameraColumn()}
        <Styled.DevicesColumn>
          {renderMicSection()}
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
      {renderFooter({ inputDeviceId, blocked })}
    </>
  );
});

PreFlightBody.displayName = 'PreFlightBody';

export default PreFlightBody;
