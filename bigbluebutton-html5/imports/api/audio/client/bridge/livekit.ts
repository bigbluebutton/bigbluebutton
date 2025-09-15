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

export default class LiveKitAudioBridge extends BaseAudioBridge {
  public readonly bridgeName: string;

  public _inputDeviceId: string | null;

  public _originalStream: MediaStream | null;

  private readonly liveKitRoom: Room;

  private readonly role: string;

  private callback: (args: { status: string; bridge: string }) => void;

  constructor() {
    super();

    this.role = SENDRECV_ROLE;
    this.bridgeName = BRIDGE_NAME;
    this.callback = () => {
      logger.warn('LiveKitAudioBridge: callback not set');
    };
    this.liveKitRoom = liveKitRoom;
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
        bridgeName: this.bridgeName,
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
        bridgeName: this.bridgeName,
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
        bridgeName: this.bridgeName,
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
        bridgeName: this.bridgeName,
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
        bridgeName: this.bridgeName,
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
        bridgeName: this.bridgeName,
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
        bridgeName: this.bridgeName,
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
        bridgeName: this.bridgeName,
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
        bridgeName: this.bridgeName,
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

    if (hasCurrentPub) {
      return this.publish(stream)
        .catch((error) => {
          logger.error({
            logCode: 'livekit_audio_set_input_stream_error',
            extraInfo: {
              errorMessage: (error as Error).message,
              errorName: (error as Error).name,
              errorStack: (error as Error).stack,
              bridgeName: this.bridgeName,
              role: this.role,
              inputDeviceId: this.inputDeviceId,
              streamData: MediaStreamUtils.getMediaStreamLogData(stream),
            },
          }, 'LiveKit: set audio input stream failed');
          throw error;
        });
    }

    // No previous publication, so no need to publish yet - unmute will handle it
    return Promise.resolve();
  }

  async liveChangeInputDevice(deviceId: string): Promise<MediaStream | null> {
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
    const hasUnmutedTrack = trackPubs.some((pub) => !pub.isMuted);

    // We have a published track, use LK's own method to switch the device
    if (hasUnmutedTrack) {
      await liveKitRoom.switchActiveDevice('audioinput', deviceId, false);
      if (this.publicationTrackStream) {
        this.originalStream = this.publicationTrackStream;
        this.inputDeviceId = deviceId;
      } else {
        logger.warn({
          logCode: 'livekit_audio_switch_pub_stream_missing',
          extraInfo: {
            bridgeName: this.bridgeName,
            role: this.role,
            deviceId,
            streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
          },
        }, 'LiveKit: publication stream missing after device switch');
      }

      return this.inputStream;
    }

    let newStream: MediaStream | null = null;
    let backupStream: MediaStream | null = null;

    try {
      const constraints = {
        audio: getAudioConstraints({ deviceId }),
      };

      // Backup stream (current one) in case the switch fails
      if (this.inputStream && this.inputStream.active) {
        backupStream = this.inputStream ? this.inputStream.clone() : null;
        this.inputStream.getAudioTracks().forEach((track) => track.stop());
      }

      newStream = await doGUM(constraints);
      await this.setInputStream(newStream, { deviceId });
      if (backupStream && backupStream.active) {
        backupStream.getAudioTracks().forEach((track) => track.stop());
        backupStream = null;
      }

      return newStream;
    } catch (error) {
      // Device change failed. Clean up the tentative new stream to avoid lingering
      // stuff, then try to rollback to the previous input stream.
      if (newStream && typeof newStream.getAudioTracks === 'function') {
        newStream.getAudioTracks().forEach((t) => t.stop());
        newStream = null;
      }

      // Rollback to backup stream
      if (backupStream && backupStream.active) {
        this.setInputStream(backupStream).catch((rollbackError) => {
          logger.error({
            logCode: 'audio_changeinputdevice_rollback_failure',
            extraInfo: {
              bridgeName: this.bridgeName,
              deviceId,
              errorName: rollbackError.name,
              errorMessage: rollbackError.message,
            },
          }, 'Microphone device change rollback failed - the device may become silent');

          if (backupStream) {
            backupStream.getAudioTracks().forEach((track) => track.stop());
          }

          backupStream = null;
        });
      }

      throw error;
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
          bridgeName: this.bridgeName,
          role: this.role,
          enabled: shouldEnable,
          inputDeviceId: this.inputDeviceId,
          streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
        },
      }, `LiveKit: setSenderTrackEnabled failed - ${error.message}`);
    };

    if (shouldEnable) {
      const trackName = `${Auth.userID}-audio-${this.inputDeviceId ?? 'default'}`;
      const currentPubs = trackPubs.filter((pub) => pub.trackName === trackName && pub.isMuted);

      // Track was not unpublished on previous mute toggle, so no need to publish again
      // Just toggle mute.
      if (currentPubs.length) {
        currentPubs.forEach((pub) => pub.unmute());
        logger.debug({
          logCode: 'livekit_audio_track_unmute',
          extraInfo: {
            bridgeName: this.bridgeName,
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
            bridgeName: this.bridgeName,
            role: this.role,
            trackName,
          },
        }, `LiveKit: audio track unmute+publish - ${trackName}`);
      } else {
        logger.debug({
          logCode: 'livekit_audio_track_unmute_noop',
          extraInfo: {
            bridgeName: this.bridgeName,
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
          bridgeName: this.bridgeName,
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
          bridgeName: this.bridgeName,
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

  private async publish(inputStream: MediaStream | null): Promise<void> {
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
        name: `${Auth.userID}-audio-${this.inputDeviceId ?? 'default'}`,
      };
      const constraints = getAudioConstraints({ deviceId: this.inputDeviceId });

      if (this.hasMicrophoneTrack()) await this.unpublish();

      if (inputStream && !inputStream.active) {
        logger.warn({
          logCode: 'livekit_audio_publish_inactive_stream',
          extraInfo: {
            bridgeName: this.bridgeName,
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
            bridgeName: this.bridgeName,
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
            bridgeName: this.bridgeName,
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
          bridgeName: this.bridgeName,
          role: this.role,
          inputDeviceId: this.inputDeviceId,
          streamData: MediaStreamUtils.getMediaStreamLogData(inputStream || this.originalStream),
        },
      }, 'LiveKit: failed to publish audio track');
      throw error;
    }
  }

  private unpublish(): Promise<void | (void | LocalTrackPublication | undefined)[]> {
    const micTrackPublications = this.getLocalMicTrackPubs();

    if (!micTrackPublications || micTrackPublications.length === 0) return Promise.resolve();

    const unpublishers = micTrackPublications.map((publication: LocalTrackPublication) => {
      if (publication?.track && publication?.source === Track.Source.Microphone) {
        const stopOnUnpublish = liveKitRoom?.options?.stopLocalTrackOnUnpublish ?? false;

        return this.liveKitRoom.localParticipant.unpublishTrack(publication.track, stopOnUnpublish);
      }

      return Promise.resolve();
    });

    return Promise.all(unpublishers)
      .then(() => {
        const unpublishedTracks = micTrackPublications.map((pub) => pub?.trackSid);
        logger.debug({
          logCode: 'livekit_audio_unpublish',
          extraInfo: {
            bridgeName: this.bridgeName,
            role: this.role,
            unpublishedTracks,
          },
        }, 'LiveKit: audio track unpublished');
      })
      .catch((error) => {
        logger.error({
          logCode: 'livekit_audio_unpublish_error',
          extraInfo: {
            errorMessage: (error as Error).message,
            errorName: (error as Error).name,
            errorStack: (error as Error).stack,
            bridgeName: this.bridgeName,
            role: this.role,
          },
        }, 'LiveKit: failed to unpublish audio track');
      });
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
          bridgeName: this.bridgeName,
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
          bridgeName: this.bridgeName,
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
            bridgeName: this.bridgeName,
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
            bridgeName: this.bridgeName,
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
