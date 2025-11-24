import {
  AudioPresets,
  Track,
  ConnectionState,
  RoomEvent,
  ParticipantEvent,
  type TrackPublication,
  type LocalTrack,
  type LocalTrackPublication,
  type RemoteTrack,
  type RemoteTrackPublication,
  type Room,
  type TrackPublishOptions,
} from 'livekit-client';
import Auth from '/imports/ui/services/auth';
import BaseAudioBridge from './base';
import logger from '/imports/startup/client/logger';
import browserInfo from '/imports/utils/browserInfo';
import {
  getAudioConstraints,
  filterSupportedConstraints,
  doGUM,
} from '/imports/api/audio/client/bridge/service';
import { liveKitRoom, getLKStats } from '/imports/ui/services/livekit';
import MediaStreamUtils from '/imports/utils/media-stream-utils';

const BRIDGE_NAME = 'livekit';
const SENDRECV_ROLE = 'sendrecv';
const PUBLISH_OP = 'publish';
const UNPUBLISH_OP = 'unpublish';
const IS_CHROME = browserInfo.isChrome;
const ROOM_CONNECTION_TIMEOUT = 15000;

interface JoinOptions {
  inputStream: MediaStream;
  muted: boolean;
}

interface SetInputStreamOptions {
  deviceId?: string | null;
  force?: boolean;
}

interface PublishQueueItem {
  type: string;
  stream?: MediaStream | null;
  deviceId?: string | null;
  resolve?: (value: void | Promise<void>) => void;
  reject?: (reason?: unknown) => void;
}

export default class LiveKitAudioBridge extends BaseAudioBridge {
  public readonly bridgeName: string;

  public _inputDeviceId: string | null;

  public _originalStream: MediaStream | null;

  private readonly liveKitRoom: Room;

  private readonly role: string;

  private callback: (args: { status: string; bridge: string }) => void;

  private publishQueue: Array<PublishQueueItem>;

  private isProcessingPublishQueue: boolean;

  private clientSessionUUID: string = '0';

  private static assembleTrackName(
    clientSessionId: string,
    deviceId: string | null | undefined,
  ): string {
    return `${Auth.userID}|${clientSessionId}|audio|${deviceId || 'default'}`;
  }

  constructor() {
    super();

    this.role = SENDRECV_ROLE;
    this.bridgeName = BRIDGE_NAME;
    this.callback = () => {
      logger.warn('LiveKitAudioBridge: callback not set');
    };
    this.liveKitRoom = liveKitRoom;
    this.publishQueue = [];
    this.isProcessingPublishQueue = false;
    // eslint-disable-next-line no-underscore-dangle
    this._inputDeviceId = null;
    // eslint-disable-next-line no-underscore-dangle
    this._originalStream = null;

    this.audioEnded = this.audioEnded.bind(this);
    this.handleTrackSubscribed = this.handleTrackSubscribed.bind(this);
    this.handleTrackUnsubscribed = this.handleTrackUnsubscribed.bind(this);
    this.handleTrackSubscriptionFailed = this.handleTrackSubscriptionFailed.bind(this);
    this.handleTrackSubscriptionStatusChanged = this.handleTrackSubscriptionStatusChanged.bind(this);
    this.handleLocalTrackMuted = this.handleLocalTrackMuted.bind(this);
    this.handleLocalTrackUnmuted = this.handleLocalTrackUnmuted.bind(this);
    this.handleLocalTrackPublished = this.handleLocalTrackPublished.bind(this);
    this.handleLocalTrackUnpublished = this.handleLocalTrackUnpublished.bind(this);

    this.observeLiveKitEvents();
  }

  get clientSessionId(): string {
    if (this.clientSessionUUID === '0') {
      this.clientSessionUUID = sessionStorage.getItem('clientSessionUUID') || '0';
    }

    return this.clientSessionUUID;
  }

  set inputDeviceId(deviceId: string | null) {
    // eslint-disable-next-line no-underscore-dangle
    this._inputDeviceId = deviceId;
  }

  get inputDeviceId(): string | null {
    // eslint-disable-next-line no-underscore-dangle
    return this._inputDeviceId;
  }

  get publicationTrackStream(): MediaStream | null {
    const micTrackPublications = this.getLocalMicTrackPubs();
    const publication = micTrackPublications[0];

    return publication?.track?.mediaStream || null;
  }

  get publicationTrack(): LocalTrack | null {
    const micTrackPublications = this.getLocalMicTrackPubs();
    const publication = micTrackPublications[0];

    return publication?.track || null;
  }

  get inputStream(): MediaStream | null {
    return this.originalStream || this.publicationTrackStream;
  }

  set originalStream(stream: MediaStream | null) {
    // eslint-disable-next-line no-underscore-dangle
    this._originalStream = stream;
    const streamData = MediaStreamUtils.getMediaStreamLogData(stream);
    const streamLabel = streamData?.audio?.[0]?.label ?? streamData?.id;
    const streamLogId = streamLabel ? `${streamLabel}=${streamData?.active}` : 'null';

    logger.info({
      logCode: 'livekit_audio_org_stream_set',
      extraInfo: {
        bridge: this.bridgeName,
        role: this.role,
        validStream: !!stream,
        streamData,
      },
    }, `LiveKit: original stream set - ${streamLogId}`);
  }

  get originalStream(): MediaStream | null {
    // eslint-disable-next-line no-underscore-dangle
    return this._originalStream;
  }

  private getLocalMicTrackPubs(): LocalTrackPublication[] {
    return Array.from(
      this.liveKitRoom.localParticipant.audioTrackPublications.values(),
    ).filter((publication) => publication.source === Track.Source.Microphone);
  }

  private static publicationMatchesDevice(
    publication: LocalTrackPublication | null,
    deviceId: string | null | undefined,
  ): boolean {
    const currentStream = publication?.track?.mediaStream;

    if (!currentStream || deviceId == null) return false;

    const currentStreamDeviceId = MediaStreamUtils.extractDeviceIdFromStream(currentStream, 'audio');

    return currentStreamDeviceId === deviceId;
  }

  private async audioStarted(): Promise<void> {
    this.callback({
      status: this.baseCallStates.started,
      bridge: this.bridgeName,
    });
  }

  private audioEnded(): void {
    this.callback({ status: this.baseCallStates.ended, bridge: this.bridgeName });
  }

  private audioPublished(): void {
    this.callback({ status: this.baseCallStates.audioPublished, bridge: this.bridgeName });
  }

  private static isMicrophonePublication(publication: TrackPublication): boolean {
    const { source } = publication;

    return source === Track.Source.Microphone;
  }

  private static isMicrophoneTrack(track?: LocalTrack | RemoteTrack): boolean {
    if (!track) return false;

    const { source } = track;

    return source === Track.Source.Microphone;
  }

  private handleTrackSubscribed(
    // @ts-ignore - unused for now
    track: RemoteTrack,
    publication: RemoteTrackPublication,
  ): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, trackName } = publication;

    logger.debug({
      logCode: 'livekit_audio_subscribed',
      extraInfo: {
        bridge: this.bridgeName,
        trackSid,
        trackName,
        role: this.role,
      },
    }, `LiveKit: subscribed to microphone - ${trackSid}`);
  }

  private handleTrackUnsubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
  ): void {
    if (!LiveKitAudioBridge.isMicrophoneTrack(track)) return;

    const { trackSid, trackName } = publication;
    logger.debug({
      logCode: 'livekit_audio_unsubscribed',
      extraInfo: {
        bridge: this.bridgeName,
        trackSid,
        trackName,
        role: this.role,
      },
    }, `LiveKit: unsubscribed from microphone - ${trackSid}`);
  }

  private handleTrackSubscriptionFailed(trackSid: string): void {
    logger.error({
      logCode: 'livekit_audio_subscription_failed',
      extraInfo: {
        bridge: this.bridgeName,
        trackSid,
        role: this.role,
      },
    }, `LiveKit: failed to subscribe to microphone - ${trackSid}`);
  }

  private handleTrackSubscriptionStatusChanged(
    publication: RemoteTrackPublication,
    status: TrackPublication.SubscriptionStatus,
  ): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, trackName } = publication;

    logger.debug({
      logCode: 'livekit_audio_subscription_status_changed',
      extraInfo: {
        bridge: this.bridgeName,
        trackSid,
        trackName,
        role: this.role,
        status,
      },
    }, `LiveKit: microphone subscription status changed - ${trackSid} to ${status}`);
  }

  private handleLocalTrackMuted(publication: TrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, isMuted, trackName } = publication;

    logger.info({
      logCode: 'livekit_audio_local_track_muted',
      extraInfo: {
        bridge: this.bridgeName,
        role: this.role,
        trackSid,
        trackName,
        isMuted,
      },
    }, `LiveKit: local audio track muted - ${trackSid}`);
  }

  private handleLocalTrackUnmuted(publication: TrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, isMuted, trackName } = publication;

    logger.info({
      logCode: 'livekit_audio_local_track_unmuted',
      extraInfo: {
        bridge: this.bridgeName,
        role: this.role,
        trackSid,
        trackName,
        isMuted,
      },
    }, `LiveKit: local audio track unmuted - ${trackSid}`);
  }

  private handleLocalTrackPublished(publication: LocalTrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, trackName } = publication;

    logger.info({
      logCode: 'livekit_audio_published',
      extraInfo: {
        bridge: this.bridgeName,
        role: this.role,
        trackSid,
        trackName,
        inputDeviceId: this.inputDeviceId,
        streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
      },
    }, `LiveKit: audio track published - ${trackSid}`);
  }

  private handleLocalTrackUnpublished(publication: LocalTrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, trackName } = publication;

    logger.info({
      logCode: 'livekit_audio_unpublished',
      extraInfo: {
        bridge: this.bridgeName,
        role: this.role,
        trackSid,
        trackName,
        inputDeviceId: this.inputDeviceId,
        streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
      },
    }, `LiveKit: audio track unpublished - ${trackSid}`);
  }

  private observeLiveKitEvents(): void {
    if (!this.liveKitRoom) return;

    this.removeLiveKitObservers();
    this.liveKitRoom.on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    this.liveKitRoom.on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    this.liveKitRoom.on(RoomEvent.TrackSubscriptionFailed, this.handleTrackSubscriptionFailed);
    this.liveKitRoom.on(RoomEvent.TrackSubscriptionStatusChanged, this.handleTrackSubscriptionStatusChanged);
    this.liveKitRoom.localParticipant.on(ParticipantEvent.TrackMuted, this.handleLocalTrackMuted);
    this.liveKitRoom.localParticipant.on(ParticipantEvent.TrackUnmuted, this.handleLocalTrackUnmuted);
    this.liveKitRoom.localParticipant.on(ParticipantEvent.LocalTrackPublished, this.handleLocalTrackPublished);
    this.liveKitRoom.localParticipant.on(ParticipantEvent.LocalTrackUnpublished, this.handleLocalTrackUnpublished);
  }

  private removeLiveKitObservers(): void {
    if (!this.liveKitRoom) return;

    this.liveKitRoom.off(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    this.liveKitRoom.off(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    this.liveKitRoom.off(RoomEvent.TrackSubscriptionFailed, this.handleTrackSubscriptionFailed);
    this.liveKitRoom.off(RoomEvent.TrackSubscriptionStatusChanged, this.handleTrackSubscriptionStatusChanged);
    this.liveKitRoom.localParticipant.off(ParticipantEvent.TrackMuted, this.handleLocalTrackMuted);
    this.liveKitRoom.localParticipant.off(ParticipantEvent.TrackUnmuted, this.handleLocalTrackUnmuted);
    this.liveKitRoom.localParticipant.off(ParticipantEvent.LocalTrackPublished, this.handleLocalTrackPublished);
    this.liveKitRoom.localParticipant.off(ParticipantEvent.LocalTrackUnpublished, this.handleLocalTrackUnpublished);
  }

  // eslint-disable-next-line class-methods-use-this
  supportsTransparentListenOnly(): boolean {
    return true;
  }

  // Typings for setInputStream are absent in base class and needs to be corrected
  // there and in audio-manager
  // @ts-ignore
  setInputStream(stream: MediaStream | null, options: SetInputStreamOptions = {}): Promise<void> {
    const { deviceId = null, force = false } = options;
    const streamDeviceId = MediaStreamUtils.extractDeviceIdFromStream(stream, 'audio');
    const originalDeviceId = MediaStreamUtils.extractDeviceIdFromStream(this.originalStream, 'audio');

    if ((!stream || this.originalStream?.id === stream.id || streamDeviceId === originalDeviceId)
      && !force) {
      logger.debug({
        logCode: 'livekit_audio_set_input_stream_noop',
        extraInfo: {
          bridge: this.bridgeName,
          role: this.role,
          streamData: MediaStreamUtils.getMediaStreamLogData(stream),
          originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
          deviceId: options?.deviceId,
          force: options?.force,
        },
      }, 'LiveKit: set audio input stream noop');
      return Promise.resolve();
    }

    const hasCurrentPub = this.hasMicrophoneTrack();
    let newDeviceId = deviceId;

    if (deviceId == null) {
      newDeviceId = MediaStreamUtils.extractDeviceIdFromStream(
        this.inputStream,
        'audio',
      );
    }

    this.inputDeviceId = newDeviceId;
    this.originalStream = stream;
    logger.debug({
      logCode: 'livekit_audio_set_input_stream',
      extraInfo: {
        bridge: this.bridgeName,
        role: this.role,
        inputDeviceId: this.inputDeviceId,
        streamData: MediaStreamUtils.getMediaStreamLogData(stream),
        originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
        deviceId: options?.deviceId,
        force: options?.force,
      },
    }, 'LiveKit: set audio input stream');

    if (hasCurrentPub) {
      return this.publish(stream)
        .catch((error) => {
          logger.error({
            logCode: 'livekit_audio_set_input_stream_error',
            extraInfo: {
              errorMessage: (error as Error).message,
              errorName: (error as Error).name,
              errorStack: (error as Error).stack,
              bridge: this.bridgeName,
              role: this.role,
              inputDeviceId: this.inputDeviceId,
              streamData: MediaStreamUtils.getMediaStreamLogData(stream),
              originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
            },
          }, 'LiveKit: set audio input stream failed');
          throw error;
        });
    }

    // No previous publication, so no need to publish yet - unmute will handle it
    return Promise.resolve();
  }

  async liveChangeInputDevice(deviceId: string): Promise<MediaStream | null> {
    let newStream: MediaStream | null = null;
    let backupStream: MediaStream | null = null;

    // Backup stream (current one) in case the switch fails
    const backup = () => {
      backupStream = this.inputStream ? this.inputStream.clone() : null;
    };

    // Cleanup the backup stream (if any)
    const cleanup = () => {
      if (backupStream) {
        backupStream.getAudioTracks().forEach((track) => track.stop());
        backupStream = null;
      }
    };

    // This method will rollback to a previous stream if something goes wrong
    // during the device switch. The previous stream is a clone of the current
    // input stream before the switch is attempted.
    const rollback = async () => {
      logger.warn({
        logCode: 'livekit_audio_changeinputdevice_rollback',
        extraInfo: {
          bridge: this.bridgeName,
          deviceId,
          role: this.role,
          streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
          originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
          newStreamData: MediaStreamUtils.getMediaStreamLogData(newStream),
          backupStreamData: MediaStreamUtils.getMediaStreamLogData(backupStream),
        },
      }, 'LiveKit: rolling back to previous audio input stream');

      if (newStream && typeof newStream.getAudioTracks === 'function') {
        newStream.getAudioTracks().forEach((t) => t.stop());
        newStream = null;
      }

      // Rollback to backup stream
      if (backupStream && backupStream.active) {
        // Force set the input stream even if it's the same as the current one
        // because the current one is likely broken
        try {
          await this.setInputStream(backupStream, { force: true });

          return this.inputStream;
        } catch (rollbackError) {
          logger.error({
            logCode: 'audio_changeinputdevice_rollback_failure',
            extraInfo: {
              bridge: this.bridgeName,
              deviceId,
              role: this.role,
              streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
              originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
              newStreamData: MediaStreamUtils.getMediaStreamLogData(newStream),
              backupStreamData: MediaStreamUtils.getMediaStreamLogData(backupStream),
              errorName: (rollbackError as Error)?.name,
              errorMessage: (rollbackError as Error)?.message,
              errorStack: (rollbackError as Error)?.stack,
            },
          }, 'Microphone device change rollback failed - the device may become silent');
          // Cleanup the backup stream reference if the rollback failed. We have
          // no other recourse at this point.
          cleanup();
        }
      }

      // No backup stream to rollback to. We are likely in a bad state at this point.
      // Try restarting fresh with doGUM as a last resort.
      try {
        const constraints = {
          audio: getAudioConstraints(),
        };
        const rollbackStream = await doGUM(constraints);
        await this.setInputStream(rollbackStream, { force: true });
        cleanup();

        return rollbackStream;
      } catch (error) {
        // Rollback failed. Nothing we can do at this point.
        cleanup();
        throw error;
      }
    };

    logger.debug({
      logCode: 'livekit_audio_live_change_input_device',
      extraInfo: {
        bridge: this.bridgeName,
        deviceId,
        streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
        originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
      },
    }, 'LiveKit: live change input device');

    // Remove all input audio tracks from the stream
    // This will effectively mute the microphone
    // and keep the audio output working
    if (deviceId === 'listen-only') {
      const stream = this.inputStream;

      if (stream) {
        stream.getAudioTracks().forEach((track) => {
          track.stop();
          stream.removeTrack(track);
        });
      }

      return stream;
    }

    const trackPubs = this.getLocalMicTrackPubs();

    // We have a published track, use LK's own method to switch the device
    if (trackPubs.length > 0) {
      try {
        // Backup stream (current one) in case the switch fails
        backup();

        // We have a published track, but it's stream is inactive. Likely a dead
        // stream. Restart the track.
        if (this.publicationTrackStream && !this.publicationTrackStream.active) {
          logger.warn({
            logCode: 'livekit_audio_live_change_input_device_inactive_stream',
            extraInfo: {
              bridge: this.bridgeName,
              role: this.role,
              deviceId,
              streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
              originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
              publicationStreamData: MediaStreamUtils.getMediaStreamLogData(this.publicationTrackStream),
              backupStreamData: MediaStreamUtils.getMediaStreamLogData(backupStream),
            },
          }, 'LiveKit: publication track stream is inactive before device switch');

          const track = this.publicationTrack;

          if (track) await track.restartTrack(getAudioConstraints({ deviceId }));
        } else {
          const switched = await liveKitRoom.switchActiveDevice('audioinput', deviceId, true);

          // This is a soft failure - the browser may have decided simply not to switch
          // with no error. Go figure. Log it and throw so that it bubbles up to the user.
          if (!switched) {
            logger.warn({
              logCode: 'livekit_audio_input_device_not_switched',
              extraInfo: {
                bridge: this.bridgeName,
                deviceId,
                streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
                originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
                newStreamData: MediaStreamUtils.getMediaStreamLogData(newStream),
                backupStreamData: MediaStreamUtils.getMediaStreamLogData(backupStream),
              },
            }, 'LiveKit: audio device not switched');
            cleanup();

            throw new Error('LiveKit audio device not switched');
          }
        }

        if (this.publicationTrackStream) {
          this.inputDeviceId = MediaStreamUtils.extractDeviceIdFromStream(this.publicationTrackStream, 'audio');
          this.originalStream = this.publicationTrackStream;
        } else {
          // Something specially weird happened here. We should have a publication
          // track stream at this point, but we don't. Log it for further inspection
          // and clean up. The input stream remains unchanged.

          this.inputDeviceId = deviceId;
          cleanup();

          logger.warn({
            logCode: 'livekit_audio_switch_pub_stream_missing',
            extraInfo: {
              bridge: this.bridgeName,
              role: this.role,
              deviceId,
              streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
              originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
              newStreamData: MediaStreamUtils.getMediaStreamLogData(newStream),
              backupStreamData: MediaStreamUtils.getMediaStreamLogData(backupStream),
            },
          }, 'LiveKit: publication stream missing after device switch');
        }

        return this.inputStream;
      } catch (error) {
        logger.error({
          logCode: 'livekit_audio_live_change_input_device_error',
          extraInfo: {
            errorMessage: (error as Error)?.message,
            errorName: (error as Error)?.name,
            errorStack: (error as Error)?.stack,
            bridge: this.bridgeName,
            role: this.role,
            deviceId,
            streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
            originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
            newStreamData: MediaStreamUtils.getMediaStreamLogData(newStream),
            backupStreamData: MediaStreamUtils.getMediaStreamLogData(backupStream),
          },
        }, 'LiveKit: live change input device failed');
        // This is a really unexpected. If LK's own device switch failed,
        // we need to unpublish the current tracks and rollback.
        await this.doUnpublish();
        await rollback();

        throw error;
      }
    } else {
      // No published track at this point, so we are effectively muted.
      // Way easier - just get a new stream and set it as the input stream.
      try {
        const constraints = {
          audio: getAudioConstraints({ deviceId }),
        };

        // Backup stream (current one) in case the switch fails
        backup();
        newStream = await doGUM(constraints);
        await this.setInputStream(newStream, { deviceId });
        cleanup();

        return newStream;
      } catch (error) {
        // Device change failed. Clean up the tentative new stream to avoid lingering
        // stuff, then try to rollback to the previous input stream.
        await rollback();
        throw error;
      }
    }
  }

  setSenderTrackEnabled(shouldEnable: boolean): void {
    const trackPubs = this.getLocalMicTrackPubs();
    const handleMuteError = (error: Error) => {
      logger.error({
        logCode: 'livekit_audio_set_sender_track_error',
        extraInfo: {
          errorMessage: error.message,
          errorName: error.name,
          errorStack: error.stack,
          bridge: this.bridgeName,
          role: this.role,
          enabled: shouldEnable,
          inputDeviceId: this.inputDeviceId,
          streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
        },
      }, `LiveKit: setSenderTrackEnabled failed - ${error.message}`);
    };

    if (shouldEnable) {
      const trackName = LiveKitAudioBridge.assembleTrackName(this.clientSessionId, this.inputDeviceId);
      const currentPubs = trackPubs.filter((pub) => {
        return LiveKitAudioBridge.publicationMatchesDevice(pub, this.inputDeviceId) && pub.isMuted;
      });

      // Track was not unpublished on previous mute toggle, so no need to publish again
      // Just toggle mute.
      if (currentPubs.length) {
        currentPubs.forEach((pub) => pub.unmute());
        logger.debug({
          logCode: 'livekit_audio_track_unmute',
          extraInfo: {
            bridge: this.bridgeName,
            role: this.role,
            trackName,
          },
        }, `LiveKit: unmuting audio track - ${trackName}`);
      } else if (trackPubs.length === 0) {
        // Track was unpublished on previous mute toggle, so publish again
        // If audio hasn't been shared yet, do nothing
        this.publish(this.originalStream).catch(handleMuteError);
        logger.debug({
          logCode: 'livekit_audio_track_unmute_publish',
          extraInfo: {
            bridge: this.bridgeName,
            role: this.role,
            trackName,
          },
        }, `LiveKit: audio track unmute+publish - ${trackName}`);
      } else {
        logger.debug({
          logCode: 'livekit_audio_track_unmute_noop',
          extraInfo: {
            bridge: this.bridgeName,
            role: this.role,
            trackName,
            trackPubs,
          },
        }, 'LiveKit: audio track unmute no-op');
      }
    } else {
      // @ts-ignore
      const LIVEKIT_SETTINGS = window.meetingClientSettings.public.media?.livekit?.audio;

      if (LIVEKIT_SETTINGS?.unpublishOnMute) {
        this.unpublish();
      } else {
        this.liveKitRoom.localParticipant.setMicrophoneEnabled(false).catch(handleMuteError);
      }
    }
  }

  async changeOutputDevice(deviceId: string): Promise<void> {
    try {
      const switched = await this.liveKitRoom.switchActiveDevice(
        'audiooutput',
        deviceId,
        true,
      );

      if (!switched) throw new Error('Failed to switch audio output device');

      const activeDevices = Array.from(
        this.liveKitRoom.localParticipant.activeDeviceMap.entries(),
      );

      logger.debug({
        logCode: 'livekit_audio_change_output_device',
        extraInfo: {
          bridge: this.bridgeName,
          role: this.role,
          deviceId,
          activeDevices,
        },
      }, 'LiveKit: audio output device changed');
    } catch (error) {
      logger.error({
        logCode: 'livekit_audio_change_output_device_error',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          errorStack: (error as Error).stack,
          bridge: this.bridgeName,
          role: this.role,
          deviceId,
        },
      }, 'LiveKit: change audio output device failed');

      throw error;
    }
  }

  private hasMicrophoneTrack(): boolean {
    const tracks = this.getLocalMicTrackPubs();

    return tracks.length > 0;
  }

  private async processPublishQueue(): Promise<void> {
    if (this.isProcessingPublishQueue) return;

    this.isProcessingPublishQueue = true;

    while (this.publishQueue.length > 0) {
      const operation = this.publishQueue.shift();

      if (operation) {
        const micPubs = this.getLocalMicTrackPubs();
        const currentPub = micPubs[0];
        const currentStream = currentPub?.track?.mediaStream ?? null;
        const currentTrackName = currentPub?.trackName;
        let handled = false;

        // If an unpublish is followed by a publish for the same track, skip both.
        if (operation.type === UNPUBLISH_OP) {
          const nextOp = this.publishQueue[0];

          if (micPubs.length > 0 && nextOp && nextOp.type === PUBLISH_OP) {
            const matchesDevice = LiveKitAudioBridge.publicationMatchesDevice(
              currentPub,
              nextOp.deviceId,
            );

            if (matchesDevice
              && currentStream?.active
              && currentStream?.id === nextOp.stream?.id) {
              this.publishQueue.shift(); // Consume publish as it's the same track
              operation.resolve?.();
              nextOp.resolve?.();
              logger.warn({
                logCode: 'livekit_audio_unpublish_publish_noop',
                extraInfo: {
                  bridge: this.bridgeName,
                  role: this.role,
                  trackName: currentTrackName,
                  currentStreamData: MediaStreamUtils.getMediaStreamLogData(currentStream),
                  newStreamData: MediaStreamUtils.getMediaStreamLogData(nextOp?.stream),
                },
              }, 'LiveKit: skipping unpublish/publish sequence for the same track');
              handled = true;
            }
          }
        }

        if (!handled) {
          try {
            switch (operation.type) {
              case PUBLISH_OP: {
                const matchesDevice = LiveKitAudioBridge.publicationMatchesDevice(
                  currentPub,
                  operation.deviceId,
                );

                // If the requested track is already published, it's a no-op,
                // as long as the underlying stream is active.
                if (currentPub
                  && matchesDevice
                  && currentStream?.active
                  && (operation.stream && operation.stream.id === currentStream?.id)) {
                  logger.warn({
                    logCode: 'livekit_audio_publish_noop',
                    extraInfo: {
                      bridge: this.bridgeName,
                      role: this.role,
                      currentStreamData: MediaStreamUtils.getMediaStreamLogData(currentStream),
                      newStreamData: MediaStreamUtils.getMediaStreamLogData(operation?.stream),
                    },
                  }, 'LiveKit: skipping publish request for an already published and active track');
                  operation.resolve?.();
                  break;
                }

                // Stale request check
                if (operation.deviceId !== this.inputDeviceId) {
                  logger.warn({
                    logCode: 'livekit_audio_publish_stale',
                    extraInfo: {
                      bridge: this.bridgeName,
                      role: this.role,
                      requestedDeviceId: operation.deviceId,
                      currentDeviceId: this.inputDeviceId,
                      currentStreamData: MediaStreamUtils.getMediaStreamLogData(currentStream),
                      newStreamData: MediaStreamUtils.getMediaStreamLogData(operation?.stream),
                    },
                  }, 'LiveKit: stale audio publish request discarded');
                  operation.resolve?.();
                  break;
                }

                // eslint-disable-next-line no-await-in-loop
                await this.doPublish(operation.stream ?? null);
                operation.resolve?.();
                break;
              }
              case UNPUBLISH_OP:
                // eslint-disable-next-line no-await-in-loop
                await this.doUnpublish();
                operation.resolve?.();
                break;
              default:
                operation.resolve?.();
                break;
            }
          } catch (error) {
            logger.error({
              logCode: 'livekit_audio_queue_op_error',
              extraInfo: {
                errorMessage: (error as Error).message,
                errorName: (error as Error).name,
                errorStack: (error as Error).stack,
                bridge: this.bridgeName,
                role: this.role,
                operationType: operation.type,
                newStreamData: MediaStreamUtils.getMediaStreamLogData(operation?.stream),
              },
            }, `LiveKit: publish queue operation failed - ${operation.type}`);
            operation.reject?.(error);
          }
        }
      }
    }

    this.isProcessingPublishQueue = false;
  }

  private dispatchPublishOperation(operation: PublishQueueItem): void {
    this.publishQueue.push(operation);
    this.processPublishQueue();
  }

  private flushPublishQueue(operationToFlush?: string): void {
    this.publishQueue.forEach((op) => {
      if (op.resolve && (!operationToFlush || op.type === operationToFlush)) {
        // Resolve as cancellations/supersedings are expected behavior here.
        op.resolve();
      }
    });

    if (operationToFlush) {
      this.publishQueue = this.publishQueue.filter((op) => op.type !== operationToFlush);
    } else {
      this.publishQueue = [];
    }
  }

  private publish(inputStream: MediaStream | null): Promise<void> {
    return new Promise((resolve, reject) => {
      // Discard trailing, unprocessed publish requests.
      this.flushPublishQueue(PUBLISH_OP);
      this.dispatchPublishOperation({
        type: PUBLISH_OP,
        stream: inputStream,
        deviceId: this.inputDeviceId,
        resolve,
        reject,
      });
    });
  }

  private unpublish(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Discard ALL trailing, unprocessed requests.
      this.flushPublishQueue();
      this.dispatchPublishOperation({
        type: UNPUBLISH_OP,
        resolve,
        reject,
      });
    });
  }

  private async doPublish(inputStream: MediaStream | null): Promise<void> {
    try {
      if (this.hasMicrophoneTrack()) await this.doUnpublish();
    } catch (error) {
      logger.warn({
        logCode: 'livekit_audio_pub_unpub_failure',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          errorStack: (error as Error).stack,
          bridge: this.bridgeName,
          role: this.role,
        },
      }, 'LiveKit: failed to unpublish audio track before publish');
    }

    try {
      // @ts-ignore
      const LIVEKIT_SETTINGS = window.meetingClientSettings.public.media?.livekit?.audio;
      const basePublishOptions: TrackPublishOptions = LIVEKIT_SETTINGS?.publishOptions || {
        audioPreset: AudioPresets.music,
        dtx: true,
        red: true,
        forceStereo: false,
      };
      const publishOptions = {
        ...basePublishOptions,
        source: Track.Source.Microphone,
        name: LiveKitAudioBridge.assembleTrackName(this.clientSessionId, this.inputDeviceId),
      };
      const constraints = getAudioConstraints({ deviceId: this.inputDeviceId });

      if (inputStream && !inputStream.active) {
        logger.warn({
          logCode: 'livekit_audio_publish_inactive_stream',
          extraInfo: {
            bridge: this.bridgeName,
            role: this.role,
            inputDeviceId: this.inputDeviceId,
            streamData: MediaStreamUtils.getMediaStreamLogData(inputStream),
          },
        }, 'LiveKit: audio stream is inactive, fallback');
      }

      if (inputStream && inputStream.active) {
        // Get tracks from the stream and publish them. Map into an array of
        // Promise objects and wait for all of them to resolve.
        logger.debug({
          logCode: 'livekit_audio_publish_with_stream',
          extraInfo: {
            bridge: this.bridgeName,
            role: this.role,
            inputDeviceId: this.inputDeviceId,
            streamData: MediaStreamUtils.getMediaStreamLogData(inputStream),
          },
        }, 'LiveKit: publishing audio track with stream');
        const trackPublishers = inputStream.getAudioTracks()
          .map((track) => {
            return this.liveKitRoom.localParticipant.publishTrack(track, publishOptions);
          });
        await Promise.all(trackPublishers);
      } else {
        await this.liveKitRoom.localParticipant.setMicrophoneEnabled(
          true,
          constraints,
          publishOptions,
        );
        this.originalStream = this.inputStream;
        logger.debug({
          logCode: 'livekit_audio_publish_without_stream',
          extraInfo: {
            bridge: this.bridgeName,
            role: this.role,
            inputDeviceId: this.inputDeviceId,
            streamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
          },
        }, 'LiveKit: published audio track without stream');
      }

      this.audioPublished();
    } catch (error) {
      logger.error({
        logCode: 'livekit_audio_publish_error',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          errorStack: (error as Error).stack,
          bridge: this.bridgeName,
          role: this.role,
          inputDeviceId: this.inputDeviceId,
          streamData: MediaStreamUtils.getMediaStreamLogData(inputStream || this.originalStream),
        },
      }, 'LiveKit: failed to publish audio track');
      throw error;
    }
  }

  private async doUnpublish(): Promise<void> {
    const micTrackPublications = this.getLocalMicTrackPubs();

    if (!micTrackPublications || micTrackPublications.length === 0) return;

    const unpublishers = micTrackPublications.map((publication: LocalTrackPublication) => {
      if (publication?.track && publication?.source === Track.Source.Microphone) {
        const stopOnUnpublish = liveKitRoom?.options?.stopLocalTrackOnUnpublish ?? false;

        return this.liveKitRoom.localParticipant.unpublishTrack(publication.track, stopOnUnpublish);
      }

      return Promise.resolve();
    });

    try {
      await Promise.all(unpublishers);
      const unpublishedTracks = micTrackPublications.map((pub) => pub?.trackSid);
      logger.debug({
        logCode: 'livekit_audio_unpublish',
        extraInfo: {
          bridge: this.bridgeName,
          role: this.role,
          unpublishedTracks,
        },
      }, 'LiveKit: audio track unpublish executed');
    } catch (error) {
      logger.error({
        logCode: 'livekit_audio_unpublish_error',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          errorStack: (error as Error).stack,
          bridge: this.bridgeName,
          role: this.role,
        },
      }, 'LiveKit: failed to unpublish audio track');
      throw error;
    }
  }

  private waitForRoomConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.liveKitRoom.state === ConnectionState.Connected) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        this.liveKitRoom.off(RoomEvent.Connected, onRoomConnected);
        reject(new Error('Room connection timeout'));
      }, ROOM_CONNECTION_TIMEOUT);
      const onRoomConnected = () => {
        clearTimeout(timeout);
        resolve();
      };

      this.liveKitRoom.once(RoomEvent.Connected, onRoomConnected);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getPeerConnection(): RTCPeerConnection | null {
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  async getStats(): Promise<Map<string, unknown>> {
    return getLKStats();
  }

  async joinAudio(
    options: JoinOptions,
    callback: (args: { status: string; bridge: string }) => void,
  ): Promise<void> {
    this.callback = callback;
    const {
      muted,
      inputStream,
    } = options;

    try {
      await this.waitForRoomConnection();
      this.originalStream = inputStream;

      if (!muted) await this.publish(inputStream);

      this.audioStarted();
    } catch (error) {
      logger.error({
        logCode: 'livekit_audio_init_error',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          errorStack: (error as Error).stack,
          bridge: this.bridgeName,
          role: this.role,
          inputDeviceId: this.inputDeviceId,
          streamData: MediaStreamUtils.getMediaStreamLogData(inputStream),
        },
      }, `LiveKit: activate audio failed: ${(error as Error).message}`);
      throw error;
    }
  }

  // TODO implement transfer call
  // eslint-disable-next-line class-methods-use-this
  transferCall(onTransferSuccess: () => void): boolean {
    // NOTE: This is a placeholder method for future implementation
    onTransferSuccess();
    return true;
  }

  async updateAudioConstraints(constraints: MediaTrackConstraints): Promise<void> {
    try {
      if (typeof constraints !== 'object') return;

      const matchConstraints = filterSupportedConstraints(constraints);

      if (IS_CHROME) {
        // @ts-ignore
        matchConstraints.deviceId = this.inputDeviceId;
        const stream = await doGUM({ audio: matchConstraints });
        await this.setInputStream(stream, { deviceId: this.inputDeviceId, force: true });
      } else {
        this.inputStream?.getAudioTracks()
          .forEach((track) => track.applyConstraints(matchConstraints));
      }
    } catch (error) {
      logger.error({
        logCode: 'livekit_audio_constraint_error',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          errorStack: (error as Error).stack,
          bridge: this.bridgeName,
          role: this.role,
        },
      }, 'LiveKit: update audio constraints failed');
    }
  }

  exitAudio(): Promise<boolean> {
    return this.liveKitRoom.localParticipant.setMicrophoneEnabled(false)
      .then(() => this.unpublish())
      .then(() => {
        logger.info({
          logCode: 'livekit_audio_exit',
          extraInfo: {
            bridge: this.bridgeName,
            role: this.role,
          },
        }, 'LiveKit: audio exited');
        return true;
      })
      .catch((error) => {
        logger.error({
          logCode: 'livekit_audio_exit_error',
          extraInfo: {
            errorMessage: (error as Error).message,
            errorName: (error as Error).name,
            errorStack: (error as Error).stack,
            bridge: this.bridgeName,
            role: this.role,
          },
        }, 'LiveKit: exit audio failed');
        return false;
      })
      .finally(() => {
        this.originalStream = null;
        this.audioEnded();
      });
  }
}
