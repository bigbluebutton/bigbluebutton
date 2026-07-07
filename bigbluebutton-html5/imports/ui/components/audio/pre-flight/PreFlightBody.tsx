/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
// @ts-ignore - hark has no type declarations
import hark from 'hark';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
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
import LocalEchoContainer from '/imports/ui/components/audio/local-echo/container';
import AudioTestContainer from '/imports/ui/components/audio/audio-test/container';
import { useVideoPreview } from '/imports/ui/components/video-preview/hooks/useVideoPreview';
import PreviewService from '/imports/ui/components/video-preview/service';
import VideoService from '/imports/ui/components/video-provider/service';

const LISTEN_ONLY = 'listen-only';
// Segmented mic meter: how many ticks the "hardware" bar can light.
const METER_TICKS = 14;

type ConnectionLevel = 'good' | 'fair' | 'poor' | 'checking';
// How many of the four signal bars light per level.
const BARS_BY_LEVEL: Record<ConnectionLevel, number> = {
  good: 4,
  fair: 2,
  poor: 1,
  checking: 0,
};

const intlMessages = defineMessages({
  cameraLockedLabel: {
    id: 'app.preFlight.cameraLockedLabel',
    description: 'Pre-flight camera locked label',
  },
  findingDevicesLabel: {
    id: 'app.preFlight.findingDevicesLabel',
    description: 'Pre-flight finding devices label',
  },
  permissionDeniedTitle: {
    id: 'app.preFlight.permissionDeniedTitle',
    description: 'Pre-flight microphone permission denied title',
  },
  permissionDeniedLabel: {
    id: 'app.preFlight.permissionDeniedLabel',
    description: 'Pre-flight microphone permission denied label',
  },
  tryAgainLabel: {
    id: 'app.preFlight.tryAgainLabel',
    description: 'Pre-flight retry permission button label',
  },
  micLevelLabel: {
    id: 'app.preFlight.micLevelLabel',
    description: 'Pre-flight microphone level meter caption',
  },
  cameraOffLabel: {
    id: 'app.preFlight.cameraOffLabel',
    description: 'Pre-flight camera off label',
  },
  turnCameraOn: {
    id: 'app.preFlight.turnCameraOn',
    description: 'Aria label to turn the camera on',
  },
  turnCameraOff: {
    id: 'app.preFlight.turnCameraOff',
    description: 'Aria label to turn the camera off',
  },
  muteMic: {
    id: 'app.preFlight.muteMic',
    description: 'Aria label to mute the microphone before joining',
  },
  unmuteMic: {
    id: 'app.preFlight.unmuteMic',
    description: 'Aria label to unmute the microphone before joining',
  },
  mirrorLabel: {
    id: 'app.preFlight.mirrorLabel',
    description: 'Aria label to flip the self-view mirroring',
  },
  connectionGood: {
    id: 'app.preFlight.connectionGood',
    description: 'Good connection hint label',
  },
  connectionFair: {
    id: 'app.preFlight.connectionFair',
    description: 'Fair connection hint label',
  },
  connectionWeak: {
    id: 'app.preFlight.connectionWeak',
    description: 'Weak connection hint label',
  },
  connectionChecking: {
    id: 'app.preFlight.connectionChecking',
    description: 'Checking connection hint label',
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

const connectionLabelByLevel: Record<
  ConnectionLevel,
  { id: string; description: string }
> = {
  good: intlMessages.connectionGood,
  fair: intlMessages.connectionFair,
  poor: intlMessages.connectionWeak,
  checking: intlMessages.connectionChecking,
};

// Segmented mic level (0..METER_TICKS) from hark, mirroring the normalization
// the shared AudioStreamVolume meter uses so the read matches the rest of the
// client. Returns 0 when there is no stream (e.g. pre-muted / listen only).
const useMicLevelTicks = (stream: MediaStream | null): number => {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    if (!stream) {
      setTicks(0);
      return undefined;
    }
    let observer: { stop: () => void } | undefined;
    try {
      observer = hark(stream, { interval: 100 });
      (
        observer as unknown as {
          on: (e: string, cb: (db: number) => void) => void;
        }
      ).on('volume_change', (dbVolume: number) => {
        const linear = 10 ** (dbVolume / 65) * 50;
        const level = Math.max(0, Math.min(1, linear / 25));
        setTicks(Math.round(level * METER_TICKS));
      });
    } catch (error) {
      setTicks(0);
    }
    return () => observer?.stop();
  }, [stream]);

  return ticks;
};

// Honest connection hint: a true WebRTC RTT is not available pre-admission, so
// this reads navigator.connection.effectiveType and maps it to a coarse level.
// When the API is absent (Firefox/Safari) we cannot detect a problem, so we
// report "good" rather than fake a precise measurement.
const useConnectionLevel = (): ConnectionLevel => {
  const [level, setLevel] = useState<ConnectionLevel>('checking');

  useEffect(() => {
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string } & Partial<EventTarget>;
      mozConnection?: unknown;
      webkitConnection?: unknown;
    };
    const conn = (nav.connection
      || nav.mozConnection
      || nav.webkitConnection) as
      | ({ effectiveType?: string } & Partial<EventTarget>)
      | undefined;

    const compute = () => {
      const type = conn?.effectiveType;
      if (!type || type === '4g') {
        setLevel('good');
      } else if (type === '3g') {
        setLevel('fair');
      } else {
        setLevel('poor');
      }
    };

    compute();
    conn?.addEventListener?.('change', compute);
    return () => conn?.removeEventListener?.('change', compute);
  }, []);

  return level;
};

export interface PreFlightBodyHandle {
  getMicStream: () => MediaStream | null;
  markStreamHandedOff: () => void;
  shareCamera: () => void;
  releaseStreams: () => void;
}

// Context handed to the footer renderer so the wrapper can drive the join.
export type PreFlightFooterContext = {
  inputDeviceId: string;
  blocked: boolean;
  micMuted: boolean;
};

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
  // Post-admission only: renders the floating on-preview mic/camera controls and
  // lets the parent trigger the actual camera share through the ref. The guest
  // waiting room passes false (there is no join yet).
  enableJoinControls: boolean;
  // Initial camera intent (mirrors the meeting auto-share setting). Post
  // admission it also decides whether the live self-view or the avatar shows first.
  shareOnJoinDefault: boolean;
  // Initial join-muted intent (mirrors mute-on-start), user-owned via the mic control.
  joinMutedDefault: boolean;
  // Name used to derive the camera-off avatar initial.
  userName?: string;
  // Video share function, injected by the post-admission wrapper. Absent in the
  // guest waiting room so this component never imports the join/share path.
  startSharing?: (deviceId: string) => void;
  renderFooter: (ctx: PreFlightFooterContext) => React.ReactNode;
}

const PreFlightBody = forwardRef<PreFlightBodyHandle, PreFlightBodyProps>(
  (props, ref) => {
    const {
      useAudioManager,
      persistDevices,
      micDisabled,
      showCamera,
      isCamLocked,
      supportsTransparentListenOnly,
      localEchoEnabled,
      enableJoinControls,
      shareOnJoinDefault,
      joinMutedDefault,
      userName,
      startSharing,
      renderFooter,
    } = props;

    const intl = useIntl();

    const initialInput: string = useAudioManager
      ? (AudioManager.inputDeviceId as unknown as string) || ''
      : (getStoredAudioInputDeviceId() as unknown as string) || '';
    const initialOutput: string = useAudioManager
      ? (AudioManager.outputDeviceId as unknown as string) || ''
      : (getStoredAudioOutputDeviceId() as unknown as string) || '';
    const permissionStatus = useAudioManager
      // @ts-ignore - temporary while hybrid (meteor+GraphQl)
      ? (AudioManager._permissionStatus.value() as string)
      : null;

    const [audioInputDevices, setAudioInputDevices] = useState<
      MediaDeviceInfo[]
    >([]);
    const [audioOutputDevices, setAudioOutputDevices] = useState<
      MediaDeviceInfo[]
    >([]);
    const [inputDeviceId, setInputDeviceId] = useState<string>(
      micDisabled ? LISTEN_ONLY : initialInput,
    );
    const [outputDeviceId, setOutputDeviceId] = useState<string>(initialOutput);
    const [micStream, setMicStream] = useState<MediaStream | null>(null);
    const [producingStream, setProducingStream] = useState(false);
    const [findingDevices, setFindingDevices] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);
    // v4: the on-preview controls own these intents (they replace the checkbox).
    // Guest waiting room (no join controls) always shows the live preview.
    const [cameraOn, setCameraOn] = useState(
      enableJoinControls ? shareOnJoinDefault : true,
    );
    const [micMuted, setMicMuted] = useState(joinMutedDefault);
    const [mirrored, setMirrored] = useState<boolean>(() => Boolean(VideoService.mirrorOwnWebcam()));

    const isMounted = useRef(true);
    const micStreamRef = useRef<MediaStream | null>(null);
    const streamHandedOff = useRef(false);

    const micTicks = useMicLevelTicks(micMuted ? null : micStream);
    const connectionLevel = useConnectionLevel();

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
      initialDeviceId: (PreviewService.webcamDeviceId?.() as string) ?? null,
      initialProfileId: PreviewService.getDefaultProfile().id,
      forceOpen: true,
      startSharing,
    });

    // Honest camera on/off: stop/resume the live video frames under the avatar,
    // so "off" genuinely goes dark instead of just hiding a running preview.
    useEffect(() => {
      const mediaStream = currentVideoStream.current?.mediaStream;
      mediaStream?.getVideoTracks().forEach((track) => {
        // eslint-disable-next-line no-param-reassign
        track.enabled = cameraOn;
      });
    }, [cameraOn, viewState, currentVideoStream]);

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

    const generateInputStream = useCallback(
      async (deviceId: string) => {
        cleanupMicStream();
        if (deviceId === LISTEN_ONLY) return null;
        const constraints = {
          audio: AudioService.getAudioConstraints({ deviceId }),
        };
        // Preview stream - do not promote its processor as the primary one.
        return AudioService.doGUM(constraints, {
          retryOnFailure: true,
          adoptProcessorAsPrimary: false,
        });
      },
      [cleanupMicStream],
    );

    const applyInputSelection = useCallback(
      (deviceId: string) => {
        setInputDeviceId(deviceId);
        if (useAudioManager) AudioService.changeInputDevice(deviceId);
        if (persistDevices) storeAudioInputDeviceId(deviceId);
      },
      [useAudioManager, persistDevices],
    );

    const setInputDevice = useCallback(
      async (deviceId: string) => {
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
            resolvedDeviceId = MediaStreamUtils.extractDeviceIdFromStream(
              stream,
              'audio',
            ) as string;
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
          logger.warn(
            {
              logCode: 'preflight_input_gum_failed',
              extraInfo: {
                errorName: (error as Error & { name: string })?.name,
                errorMessage: (error as Error)?.message,
              },
            },
            'Pre-flight: failed to acquire microphone.',
          );
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
      },
      [
        applyInputSelection,
        cleanupMicStream,
        generateInputStream,
        updateDeviceList,
      ],
    );

    const setOutputDevice = useCallback(
      async (deviceId: string) => {
        setOutputDeviceId(deviceId);
        if (persistDevices) storeAudioOutputDeviceId(deviceId);
        if (!useAudioManager) return;
        try {
          await AudioService.changeOutputDevice(deviceId, false);
        } catch (error) {
          logger.warn(
            {
              logCode: 'preflight_output_device_change_failed',
              extraInfo: {
                errorName: (error as Error & { name: string })?.name,
                errorMessage: (error as Error)?.message,
              },
            },
            'Pre-flight: failed to change output device',
          );
          notify(intl.formatMessage(intlMessages.deviceChangeFailed), 'error');
        }
      },
      [intl, persistDevices, useAudioManager],
    );

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
          .catch(() => {
            if (isMounted.current) setFindingDevices(false);
          });
        return;
      }
      AudioService.hasMicrophonePermission({
        gumOnPrompt: true,
        permissionStatus: permissionStatus as string,
      })
        .then(() => updateDeviceList())
        .then(() => {
          if (!isMounted.current) return undefined;
          setFindingDevices(false);
          return setInputDevice(initialInput || '');
        })
        .then(() => {
          if (isMounted.current) setOutputDevice(outputDeviceId || '');
        })
        .catch(() => {
          if (isMounted.current) setFindingDevices(false);
        });
    }, [micDisabled]);

    useEffect(() => {
      isMounted.current = true;
      initDevices();
      return () => {
        isMounted.current = false;
        cleanupMicStream();
      };
      // Run once on mount - device init.
    }, []);

    const onSelectWebcam = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleSelectWebcam(e);
        if (persistDevices) PreviewService.changeWebcam(e.target.value);
      },
      [handleSelectWebcam, persistDevices],
    );

    useImperativeHandle(
      ref,
      () => ({
        getMicStream: () => micStreamRef.current,
        markStreamHandedOff: () => {
          streamHandedOff.current = true;
        },
        shareCamera: () => {
          if (
            enableJoinControls
            && cameraOn
            && webcamDeviceId
            && currentVideoStream.current
          ) {
            handleStartSharing(webcamDeviceId);
          }
        },
        releaseStreams: () => {
          cleanupMicStream();
          setMicStream(null);
          terminateCameraStream(currentVideoStream.current, webcamDeviceId);
          cleanupStreamAndVideo();
        },
      }),
      [
        enableJoinControls,
        cameraOn,
        webcamDeviceId,
        handleStartSharing,
        cleanupMicStream,
        terminateCameraStream,
        currentVideoStream,
        cleanupStreamAndVideo,
      ],
    );

    const blocked = findingDevices || producingStream;

    const previewLive = !isCamLocked
      && viewState !== VIEW_STATES.error
      && !previewError
      && viewState !== VIEW_STATES.finding
      && !!availableWebcams
      && availableWebcams.length > 0;

    const avatarInitial = (userName || '').trim().charAt(0).toUpperCase();

    const renderConnectionBadge = () => (
      <Styled.ConnectionBadge data-test="preFlightConnectionBadge">
        <Styled.SignalBars
          level={connectionLevel}
          filled={BARS_BY_LEVEL[connectionLevel]}
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
          <span />
        </Styled.SignalBars>
        <span aria-live="polite">
          {intl.formatMessage(connectionLabelByLevel[connectionLevel])}
        </span>
      </Styled.ConnectionBadge>
    );

    const renderOverlayControls = () => {
      if (!enableJoinControls) return null;
      return (
        <Styled.OverlayControls>
          <Styled.OverlayButton
            type="button"
            off={!cameraOn}
            aria-pressed={cameraOn}
            aria-label={intl.formatMessage(
              cameraOn ? intlMessages.turnCameraOff : intlMessages.turnCameraOn,
            )}
            data-test="preFlightShareCameraToggle"
            onClick={() => setCameraOn((v) => !v)}
          >
            <Icon iconName={cameraOn ? 'video' : 'video_off'} />
          </Styled.OverlayButton>
          {!micDisabled && (
            <Styled.OverlayButton
              type="button"
              off={micMuted}
              aria-pressed={!micMuted}
              aria-label={intl.formatMessage(
                micMuted ? intlMessages.unmuteMic : intlMessages.muteMic,
              )}
              data-test="preFlightMuteToggle"
              onClick={() => setMicMuted((v) => !v)}
            >
              <Icon iconName={micMuted ? 'mute' : 'unmute'} />
            </Styled.OverlayButton>
          )}
        </Styled.OverlayControls>
      );
    };

    const renderAvatar = () => (
      <Styled.Avatar data-test="preFlightAvatar">
        <Styled.AvatarCircle>
          {avatarInitial || <Icon iconName="video_off" />}
        </Styled.AvatarCircle>
        <Styled.AvatarLabel>
          {intl.formatMessage(intlMessages.cameraOffLabel)}
        </Styled.AvatarLabel>
      </Styled.Avatar>
    );

    const renderCameraFrame = () => {
      if (isCamLocked) {
        return (
          <Styled.CameraOff>
            <Styled.CameraOffIcon iconName="lock" />
            <span>{intl.formatMessage(intlMessages.cameraLockedLabel)}</span>
          </Styled.CameraOff>
        );
      }
      if (viewState === VIEW_STATES.error || previewError) {
        return (
          <Styled.CameraOff>
            <Styled.CameraOffIcon iconName="video_off" />
            <Styled.PlaceholderText>
              {previewError || deviceError}
            </Styled.PlaceholderText>
          </Styled.CameraOff>
        );
      }
      if (viewState === VIEW_STATES.finding) {
        return (
          <Styled.PlaceholderText>
            {intl.formatMessage(intlMessages.findingDevicesLabel)}
          </Styled.PlaceholderText>
        );
      }
      if (!availableWebcams || availableWebcams.length === 0) {
        return (
          <Styled.CameraOff>
            <Styled.CameraOffIcon iconName="video_off" />
            <span>{intl.formatMessage(intlMessages.cameraOffLabel)}</span>
          </Styled.CameraOff>
        );
      }
      const currentWebcam = availableWebcams.find(
        (w) => w.deviceId === webcamDeviceId,
      );
      return (
        <>
          <Styled.VideoPreview
            mirrored={mirrored}
            data-test="preFlightVideoPreview"
            ref={videoRef}
            autoPlay
            playsInline
            muted
          />
          {currentWebcam?.label && cameraOn && (
            <Styled.CameraChip>{currentWebcam.label}</Styled.CameraChip>
          )}
          {!cameraOn && renderAvatar()}
        </>
      );
    };

    const renderCameraSelect = () => {
      if (findingDevices) return <Styled.Skeleton />;
      if (!availableWebcams || availableWebcams.length === 0) {
        return (
          <Styled.NotFound>
            {intl.formatMessage(intlMessages.webcamNotFoundLabel)}
          </Styled.NotFound>
        );
      }
      return (
        <Styled.SelectField>
          <select
            id="preFlightCameraSelector"
            data-test="preFlightCameraSelect"
            value={webcamDeviceId || ''}
            onChange={onSelectWebcam}
          >
            {availableWebcams.map((webcam, index) => (
              <option key={webcam.deviceId} value={webcam.deviceId}>
                {webcam.label
                  || `${intl.formatMessage(intlMessages.cameraLabel)} ${index + 1}`}
              </option>
            ))}
          </select>
        </Styled.SelectField>
      );
    };

    const renderCameraColumn = () => {
      if (!showCamera && !isCamLocked) return null;
      return (
        <Styled.CameraColumn>
          <Styled.VideoWrapper>
            {renderCameraFrame()}
            {renderConnectionBadge()}
            {previewLive && cameraOn && (
              <Styled.MirrorButton
                type="button"
                data-test="preFlightMirrorToggle"
                aria-pressed={mirrored}
                aria-label={intl.formatMessage(intlMessages.mirrorLabel)}
                onClick={() => setMirrored((v) => !v)}
              >
                <Icon iconName="undo" />
              </Styled.MirrorButton>
            )}
            {previewLive && renderOverlayControls()}
          </Styled.VideoWrapper>
          {!isCamLocked && (
            <Styled.DeviceGroup htmlFor="preFlightCameraSelector">
              {intl.formatMessage(intlMessages.cameraLabel)}
              {renderCameraSelect()}
            </Styled.DeviceGroup>
          )}
        </Styled.CameraColumn>
      );
    };

    const renderMicSection = () => {
      if (micDisabled) return null;
      return (
        <Styled.MicSlot>
          {permissionDenied ? (
            <Styled.PermissionDenied
              role="alert"
              data-test="preFlightPermissionDenied"
            >
              <Styled.PermissionIconCircle>
                <Styled.PermissionIcon iconName="warning" />
              </Styled.PermissionIconCircle>
              <Styled.PermissionBody>
                <Styled.PermissionTitle>
                  {intl.formatMessage(intlMessages.permissionDeniedTitle)}
                </Styled.PermissionTitle>
                <Styled.PermissionText>
                  {intl.formatMessage(intlMessages.permissionDeniedLabel)}
                </Styled.PermissionText>
                <Styled.SecondaryButton
                  type="button"
                  data-test="preFlightRetryPermission"
                  onClick={() => setInputDevice('')}
                >
                  {intl.formatMessage(intlMessages.tryAgainLabel)}
                </Styled.SecondaryButton>
              </Styled.PermissionBody>
            </Styled.PermissionDenied>
          ) : (
            <>
              <Styled.DeviceGroup htmlFor="preFlightInputDeviceSelector">
                {intl.formatMessage(intlMessages.microphoneLabel)}
                {findingDevices ? (
                  <Styled.Skeleton />
                ) : (
                  <Styled.SelectField>
                    <DeviceSelector
                      deviceId={inputDeviceId || ''}
                      devices={audioInputDevices}
                      kind="audioinput"
                      blocked={blocked}
                      onChange={setInputDevice}
                      intl={intl}
                      supportsTransparentListenOnly={
                        supportsTransparentListenOnly
                      }
                    />
                  </Styled.SelectField>
                )}
              </Styled.DeviceGroup>
              <div>
                <Styled.MeterCaption>
                  {intl.formatMessage(intlMessages.micLevelLabel)}
                </Styled.MeterCaption>
                <Styled.MeterTicks
                  data-test={micTicks > 0 ? 'hasVolume' : 'hasNoVolume'}
                  aria-hidden="true"
                >
                  {Array.from({ length: METER_TICKS }, (_, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <span key={i} data-on={i < micTicks ? 'true' : 'false'} />
                  ))}
                </Styled.MeterTicks>
              </div>
            </>
          )}
        </Styled.MicSlot>
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
              {findingDevices ? (
                <Styled.Skeleton />
              ) : (
                <Styled.SelectField>
                  <DeviceSelector
                    deviceId={outputDeviceId || ''}
                    devices={audioOutputDevices}
                    kind="audiooutput"
                    blocked={blocked}
                    onChange={setOutputDevice}
                    intl={intl}
                    supportsTransparentListenOnly={
                      supportsTransparentListenOnly
                    }
                  />
                </Styled.SelectField>
              )}
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
        {renderFooter({ inputDeviceId, blocked, micMuted })}
      </>
    );
  },
);

PreFlightBody.displayName = 'PreFlightBody';

export default PreFlightBody;
