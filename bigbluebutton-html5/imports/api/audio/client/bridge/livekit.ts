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
import { liveKitRoom } from '/imports/ui/services/livekit';
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

  private readonly liveKitRoom: Room;

  private readonly role: string;

  private originalStream: MediaStream | null;

  private callback: (args: { status: string; bridge: string }) => void;

  constructor() {
    super();

    this.role = SENDRECV_ROLE;
    this.bridgeName = BRIDGE_NAME;
    this.originalStream = null;
    this.callback = () => {
      logger.warn('LiveKitAudioBridge: callback not set');
    };
    this.liveKitRoom = liveKitRoom;
    // eslint-disable-next-line no-underscore-dangle
    this._inputDeviceId = null;

    this.audioEnded = this.audioEnded.bind(this);
    this.handleTrackSubscribed = this.handleTrackSubscribed.bind(this);
    this.handleTrackUnsubscribed = this.handleTrackUnsubscribed.bind(this);
    this.handleTrackSubscriptionFailed = this.handleTrackSubscriptionFailed.bind(this);
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

  get inputStream(): MediaStream | null {
    const micTrackPublications = this.getLocalMicTrackPubs();
    const publication = micTrackPublications[0];

    return this.originalStream || publication?.track?.mediaStream || null;
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

  private handleLocalTrackMuted(publication: TrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, isMuted, trackName } = publication;

    logger.debug({
      logCode: 'livekit_audio_track_muted',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        trackSid,
        trackName,
        isMuted,
      },
    }, `LiveKit: audio track muted - ${trackSid}`);
  }

  private handleLocalTrackUnmuted(publication: TrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, isMuted, trackName } = publication;

    logger.debug({
      logCode: 'livekit_audio_track_unmuted',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        trackSid,
        trackName,
        isMuted,
      },
    }, `LiveKit: audio track unmuted - ${trackSid}`);
  }

  private handleLocalTrackPublished(publication: LocalTrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, trackName } = publication;

    logger.debug({
      logCode: 'livekit_audio_published',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        trackSid,
        trackName,
      },
    }, `LiveKit: audio track published - ${trackSid}`);
  }

  private handleLocalTrackUnpublished(publication: LocalTrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, trackName } = publication;

    logger.debug({
      logCode: 'livekit_audio_unpublished',
      extraInfo: {
        bridgeName: this.bridgeName,
        role: this.role,
        trackSid,
        trackName,
      },
    }, `LiveKit: audio track unpublished - ${trackSid}`);
  }

  private observeLiveKitEvents(): void {
    if (!this.liveKitRoom) return;

    this.removeLiveKitObservers();
    this.liveKitRoom.on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    this.liveKitRoom.on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    this.liveKitRoom.on(RoomEvent.TrackSubscriptionFailed, this.handleTrackSubscriptionFailed);
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
            },
          }, 'LiveKit: set audio input stream failed');
          throw error;
        });
    }

    // No previous publication, so no need to publish yet - unmute will handle it
    return Promise.resolve();
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
        audioPreset: AudioPresets.speech,
        dtx: true,
        red: false,
        forceStereo: false,
      };
      const publishOptions = {
        ...basePublishOptions,
        source: Track.Source.Microphone,
        name: `${Auth.userID}-audio-${this.inputDeviceId ?? 'default'}`,
      };
      const constraints = getAudioConstraints({ deviceId: this.inputDeviceId });

      if (this.hasMicrophoneTrack()) await this.unpublish();

      if (inputStream) {
        const cloneStream = inputStream.clone();
        // Get tracks from the stream and publish them. Map into an array of
        // Promise objects and wait for all of them to resolve.
        const trackPublishers = cloneStream.getTracks()
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
        return this.liveKitRoom.localParticipant.unpublishTrack(publication.track);
      }

      return Promise.resolve();
    });

    return Promise.all(unpublishers)
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
      .then(() => true)
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
