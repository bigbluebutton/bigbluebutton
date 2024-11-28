// @ts-nocheck
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import BridgeService from './service';
import {
  screenShareEndAlert,
  setOutputDeviceId,
} from '/imports/ui/components/screenshare/service';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import {
  AudioPresets,
  ConnectionState,
  Track,
  Room,
  RoomEvent,
  LocalTrackPublication,
  RemoteTrackPublication,
  LocalTrack,
  RemoteTrack,
  type TrackPublishOptions,
} from 'livekit-client';
import {
  liveKitRoom,
} from '/imports/ui/services/livekit';

const BRIDGE_NAME = 'livekit';
const SCREENSHARE_VIDEO_TAG = 'screenshareVideo';
const SEND_ROLE = 'send';
const RECV_ROLE = 'recv';
const DEFAULT_VOLUME = 1;
const ROOM_CONNECTION_TIMEOUT = 15000;

interface Options {
  hasAudio?: boolean;
  outputDeviceId?: string;
}

interface PublicationData {
  track: LocalTrack | RemoteTrack;
  publication: LocalTrackPublication | RemoteTrackPublication;
}

export default class LiveKitScreenshareBridge {
  private readonly liveKitRoom: Room;

  private readonly publications: Map<string, LocalTrackPublication | RemoteTrackPublication>;

  private readonly subscriptions: Map<string, PublicationData>;

  private readonly bridgeName: string;

  private role?: string;

  private gdmStream?: MediaStream;

  private hasAudio: boolean;

  private outputDeviceId?: string;

  private streamId?: string;

  constructor() {
    this.hasAudio = false;
    this.liveKitRoom = liveKitRoom;
    this.bridgeName = BRIDGE_NAME;
    this.publications = new Map();
    this.subscriptions = new Map();

    this.handleTrackPublished = this.handleTrackPublished.bind(this);
    this.handleTrackUnpublished = this.handleTrackUnpublished.bind(this);
    this.handleTrackSubscribed = this.handleTrackSubscribed.bind(this);
    this.handleTrackUnsubscribed = this.handleTrackUnsubscribed.bind(this);

    this.observeRoomEvents();
  }

  private static isScreenShareTrack(track?: LocalTrack | RemoteTrack): boolean {
    if (!track) return false;
    const { source } = track;
    return source === Track.Source.ScreenShare || source === Track.Source.ScreenShareAudio;
  }

  private publicationStarted(): void {
    logger.info({
      logCode: 'livekit_screenshare_published',
      extraInfo: {
        bridgeName: BRIDGE_NAME,
        streamId: this.streamId,
        role: this.role,
      },
    }, 'LiveKit: screen share published');
  }

  private static publicationEnded(): void {
    screenShareEndAlert();
  }

  private handleTrackPublished(publication: LocalTrackPublication | RemoteTrackPublication): void {
    const { source, trackSid } = publication;
    if (source !== Track.Source.ScreenShare && source !== Track.Source.ScreenShareAudio) return;
    this.publications.set(trackSid, publication);
  }

  private handleTrackUnpublished(publication: LocalTrackPublication | RemoteTrackPublication): void {
    const { source, trackSid } = publication;
    if (source !== Track.Source.ScreenShare && source !== Track.Source.ScreenShareAudio) return;
    this.publications.delete(trackSid);
    this.subscriptions.delete(trackSid);
    LiveKitScreenshareBridge.publicationEnded();
  }

  private handleTrackSubscribed(
    track: LocalTrack | RemoteTrack,
    publication: LocalTrackPublication | RemoteTrackPublication,
  ): void {
    if (!LiveKitScreenshareBridge.isScreenShareTrack(track)) return;

    const { trackSid } = publication;
    this.subscriptions.set(trackSid, { track, publication });
    if (trackSid === this.streamId) this.handleViewerStart(trackSid);
  }

  private handleTrackUnsubscribed(
    track: LocalTrack | RemoteTrack,
    publication: LocalTrackPublication | RemoteTrackPublication,
  ): void {
    if (!LiveKitScreenshareBridge.isScreenShareTrack(track)) return;

    const { trackSid } = publication;
    this.subscriptions.delete(trackSid);
  }

  private observeRoomEvents(): void {
    if (!this.liveKitRoom) return;
    this.removeRoomObservers();
    this.liveKitRoom.on(RoomEvent.TrackPublished, this.handleTrackPublished);
    this.liveKitRoom.on(RoomEvent.TrackUnpublished, this.handleTrackUnpublished);
    this.liveKitRoom.on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    this.liveKitRoom.on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);

    this.liveKitRoom.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        if (LiveKitScreenshareBridge.isScreenShareTrack(publication.track)) {
          const { trackSid } = publication;
          this.publications.set(trackSid, publication);
          if (publication.isSubscribed && publication.track) {
            this.subscriptions.set(trackSid, { track: publication.track, publication });
          }
        }
      });
    });
  }

  private removeRoomObservers(): void {
    if (!this.liveKitRoom) return;
    this.liveKitRoom.off(RoomEvent.TrackPublished, this.handleTrackPublished);
    this.liveKitRoom.off(RoomEvent.TrackUnpublished, this.handleTrackUnpublished);
    this.liveKitRoom.off(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    this.liveKitRoom.off(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    this.publications.clear();
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
  getPeerConnection(): void {
    console.error('The Bridge must implement getPeerConnection');
  }

  // eslint-disable-next-line class-methods-use-this
  setVolume(volume: number): number {
    const mediaElement = document.getElementById(SCREENSHARE_VIDEO_TAG) as HTMLMediaElement;
    if (mediaElement) {
      if (typeof volume === 'number' && volume >= 0 && volume <= 1) {
        mediaElement.volume = volume;
      }
      return mediaElement.volume;
    }
    return DEFAULT_VOLUME;
  }

  // eslint-disable-next-line class-methods-use-this
  getVolume(): number {
    const mediaElement = document.getElementById(SCREENSHARE_VIDEO_TAG) as HTMLMediaElement;
    if (mediaElement) return mediaElement.volume;

    return DEFAULT_VOLUME;
  }

  handleViewerStart(streamId: string): void {
    if (this.subscriptions.has(streamId)) {
      const publicationData = this.subscriptions.get(streamId);

      if (!publicationData?.track) return;

      try {
        const { track } = publicationData;
        const mediaElement = document.getElementById(SCREENSHARE_VIDEO_TAG) as HTMLMediaElement;

        if (mediaElement) {
          if (this.hasAudio && this.outputDeviceId && typeof this.outputDeviceId === 'string') {
            setOutputDeviceId(this.outputDeviceId);
          }

          track.attach(mediaElement);
        }
      } catch (error) {
        logger.error({
          logCode: 'livekit_screenshare_viewer_start_error',
          extraInfo: {
            errorName: (error as Error).name,
            errorMessage: (error as Error).message,
            errorStack: (error as Error).stack,
            bridgeName: this.bridgeName,
            role: this.role,
          },
        }, 'LiveKit: viewer start failed');
      }
    }
  }

  async view(
    streamId: string,
    options: Options = { hasAudio: false, outputDeviceId: '' },
  ): Promise<void> {
    this.streamId = streamId;
    this.role = RECV_ROLE;
    this.hasAudio = options.hasAudio || false;
    const publication = this.publications.get(streamId);

    const handleInitError = (error: Error) => {
      logger.error({
        logCode: 'livekit_screenshare_init_error',
        extraInfo: {
          errorMessage: error.message,
          errorName: error.name,
          errorStack: error.stack,
          bridgeName: this.bridgeName,
          role: this.role,
        },
      }, `LiveKit: activate screenshare failed: ${error.message}`);
    };

    try {
      await this.waitForRoomConnection();

      if (!publication || !(publication instanceof RemoteTrackPublication)) {
        throw new Error('Publication not found');
      }

      if (publication.isSubscribed) {
        this.handleViewerStart(streamId);
        return;
      }

      publication.setSubscribed(true);
    } catch (error) {
      handleInitError(error as Error);
    }
  }

  async share(stream: MediaStream, onFailure: (error: Error) => void, contentType: string): Promise<void> {
    const LIVEKIT_SCREEN_SETTINGS = window.meetingClientSettings.public.media?.livekit?.screenshare;
    const LIVEKIT_AUDIO_SETTINGS = window.meetingClientSettings.public.media?.livekit?.audio;
    const baseAudioOptions: TrackPublishOptions = LIVEKIT_AUDIO_SETTINGS?.publishOptions || {
      audioPreset: AudioPresets.speech,
      dtx: true,
      red: false,
      forceStereo: false,
    };
    const baseVideoOptions: TrackPublishOptions = LIVEKIT_SCREEN_SETTINGS?.publishOptions || {
      videoCodec: 'vp8',
    };
    this.role = SEND_ROLE;
    this.hasAudio = BridgeService.streamHasAudioTrack(stream);
    this.gdmStream = stream;
    const handleInitError = (error: Error) => {
      logger.error({
        logCode: 'livekit_screenshare_init_error',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
          bridgeName: this.bridgeName,
          role: this.role,
        },
      }, `LiveKit: activate screenshare failed: ${error.message}`);
      onFailure(error);
    };

    try {
      const publishers = stream
        .getTracks()
        .map((track) => {
          const source = track.kind === 'audio' ? Track.Source.ScreenShareAudio : Track.Source.ScreenShare;
          const defaultPubOptions = track.kind === 'audio' ? baseAudioOptions : baseVideoOptions;
          const publishOptions = {
            ...defaultPubOptions,
            source,
            name: `${Auth.userID}-${contentType}`,
          };

          return () => this.liveKitRoom.localParticipant.publishTrack(track, publishOptions);
        });

      this.waitForRoomConnection()
        .then(() => Promise.all(publishers.map((publish) => publish())))
        .then(() => {
          this.publicationStarted();
        }).catch(handleInitError);
    } catch (publishError) {
      handleInitError(publishError as Error);
    }
  }

  async stop(): Promise<void> {
    const mediaElement = document.getElementById(SCREENSHARE_VIDEO_TAG) as HTMLMediaElement;

    if (this.role === SEND_ROLE) {
      try {
        await this.liveKitRoom.localParticipant.setScreenShareEnabled(false);
      } catch (error) {
        logger.error({
          logCode: 'livekit_screenshare_exit_error',
          extraInfo: {
            errorName: (error as Error).name,
            errorMessage: (error as Error).message,
            errorStack: (error as Error).stack,
            bridgeName: this.bridgeName,
            role: this.role,
          },
        }, 'Failed to exit screenshare');
      }
    }

    if (mediaElement && typeof mediaElement.pause === 'function') {
      mediaElement.pause();
      mediaElement.srcObject = null;
    }

    if (this.gdmStream) {
      MediaStreamUtils.stopMediaStreamTracks(this.gdmStream);
      this.gdmStream = undefined;
    }

    this.outputDeviceId = undefined;
  }
}
