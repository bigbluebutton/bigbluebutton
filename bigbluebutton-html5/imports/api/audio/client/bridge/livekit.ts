// @ts-nocheck
import {
  AudioPresets,
  Track,
  ConnectionState,
  RoomEvent,
  type LocalTrackPublication,
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
}

export default class LiveKitAudioBridge extends BaseAudioBridge {
  private readonly bridgeName: string;

  private readonly liveKitRoom: Room;

  private readonly role: string;

  private originalStream: MediaStream | null;

  private inputDeviceId?: string;

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

    this.publicationEnded = this.publicationEnded.bind(this);
  }

  get inputStream(): MediaStream | null {
    const tracks = Array.from(
      this.liveKitRoom.localParticipant.audioTrackPublications.values(),
    );
    const audioTrack = tracks.find((track) => track.source === Track.Source.Microphone);

    return audioTrack?.track?.mediaStream || null;
  }

  private publicationStarted(): void {
    this.callback({
      status: this.baseCallStates.started,
      bridge: this.bridgeName,
    });
  }

  private publicationEnded(): void {
    this.callback({ status: this.baseCallStates.ended, bridge: this.bridgeName });
  }

  // eslint-disable-next-line class-methods-use-this
  supportsTransparentListenOnly(): boolean {
    return true;
  }

  setInputStream(stream: MediaStream | null, deviceId?: string): Promise<void> {
    if (!stream || this.originalStream?.id === stream.id) return Promise.resolve();

    let newDeviceId = deviceId;

    if (deviceId == null) {
      newDeviceId = MediaStreamUtils.extractDeviceIdFromStream(
        this.inputStream,
        'audio',
      );
    }

    this.inputDeviceId = newDeviceId;
    this.originalStream = stream;

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
        }, 'Failed to set input stream');
        throw error;
      });
  }

  setSenderTrackEnabled(shouldEnable: boolean): void {
    const trackPubs = Array.from(
      this.liveKitRoom.localParticipant.audioTrackPublications.values(),
    );
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
      }, `setSenderTrackEnabled failed: ${error.message}`);
    };

    if (shouldEnable) {
      const trackName = `${Auth.userID}-audio-${this.inputDeviceId ?? 'default'}`;
      const currentPubs = trackPubs.filter((pub) => pub.trackName === trackName && pub.isMuted);

      // Track was not unpublished on previous mute toggle, so no need to publish again
      // Just toggle mute.
      if (currentPubs.length) {
        currentPubs.forEach((pub) => pub.unmute());
      } else if (trackPubs.length === 0) {
        // Track was unpublished on previous mute toggle, so publish again
        // If audio hasn't been shared yet, do nothing
        this.publish(this.originalStream).catch(handleMuteError);
      }
    } else {
      const LIVEKIT_SETTINGS = window.meetingClientSettings.public.media?.livekit?.audio;

      if (LIVEKIT_SETTINGS?.unpublishOnMute) {
        this.unpublish();
      } else {
        this.liveKitRoom.localParticipant.setMicrophoneEnabled(false).catch(handleMuteError);
      }
    }
  }

  dispatchAutoplayHandlingEvent(mediaElement: HTMLMediaElement): void {
    const tagFailedEvent = new CustomEvent('audioPlayFailed', {
      detail: { mediaElement },
    });
    window.dispatchEvent(tagFailedEvent);
    this.callback({ status: this.baseCallStates.autoplayBlocked, bridge: this.bridgeName });
  }

  private hasMicrophoneTrack(): boolean {
    const tracks = Array.from(
      this.liveKitRoom.localParticipant.audioTrackPublications.values(),
    );

    return tracks?.some((publication) => publication.source === Track.Source.Microphone);
  }

  private async publish(inputStream: MediaStream | null): Promise<void> {
    try {
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

      if (this.hasMicrophoneTrack()) {
        await this.unpublish();
      }

      this.originalStream = inputStream;

      if (this.originalStream) {
        const cloneStream = this.originalStream.clone();
        // Get tracks from the stream and publish them. Map into an array of
        // Promise objects and wait for all of them to resolve.
        const trackPublishers = cloneStream.getTracks()
          .map((track) => this.liveKitRoom.localParticipant.publishTrack(track, publishOptions));
        await Promise.all(trackPublishers);
      } else {
        await this.liveKitRoom.localParticipant.setMicrophoneEnabled(
          true,
          constraints,
          publishOptions,
        );
      }
    } catch (error) {
      logger.error({
        logCode: 'livekit_audiopublish_error',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          errorStack: (error as Error).stack,
          bridgeName: this.bridgeName,
          role: this.role,
        },
      }, 'Failed to publish audio track');
      throw error;
    }
  }

  private unpublish(): Promise<void | (void | LocalTrackPublication | undefined)[]> {
    const { audioTrackPublications } = this.liveKitRoom.localParticipant;

    if (!audioTrackPublications || audioTrackPublications.size === 0) return Promise.resolve();

    const unpublishers = Array.from(
      audioTrackPublications.values(),
    ).map((publication: LocalTrackPublication) => {
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
        }, 'Failed to unpublish audio track');
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

  async joinAudio(options: JoinOptions, callback: (args: { status: string; bridge: string }) => void): Promise<void> {
    this.callback = callback;

    try {
      await this.waitForRoomConnection();
      await this.publish(options.inputStream);
      this.publicationStarted();
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
        matchConstraints.deviceId = this.inputDeviceId;
        const stream = await doGUM({ audio: matchConstraints });
        await this.setInputStream(stream, this.inputDeviceId);
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
      }, 'Failed to update audio constraint');
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
        }, 'Failed to exit audio');
        return false;
      })
      .finally(this.publicationEnded);
  }
}
