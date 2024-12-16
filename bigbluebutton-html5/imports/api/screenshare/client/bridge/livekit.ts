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

  private readonly screenPublications: Map<string, LocalTrackPublication | RemoteTrackPublication>;

  private readonly audioPublications: Map<string, LocalTrackPublication | RemoteTrackPublication>;

  private readonly subscriptions: Map<string, PublicationData> = new Map();

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
    this.screenPublications = new Map();
    this.audioPublications = new Map();

    this.handleTrackPublished = this.handleTrackPublished.bind(this);
    this.handleTrackUnpublished = this.handleTrackUnpublished.bind(this);
    this.handleTrackSubscribed = this.handleTrackSubscribed.bind(this);
    this.handleTrackUnsubscribed = this.handleTrackUnsubscribed.bind(this);

    this.observeRoomEvents();
  }

  private static isScreenSharePublication(publication: LocalTrackPublication | RemoteTrackPublication): boolean {
    const { source } = publication;

    return source === Track.Source.ScreenShare || source === Track.Source.ScreenShareAudio;
  }

  private static isScreenShareTrack(track?: LocalTrack | RemoteTrack): boolean {
    if (!track) return false;

    const { source } = track;

    return source === Track.Source.ScreenShare || source === Track.Source.ScreenShareAudio;
  }

  getPublications(source: Track.Source): Map<string, LocalTrackPublication | RemoteTrackPublication> | null {
    if (source === Track.Source.ScreenShare) {
      return this.screenPublications;
    }
    if (source === Track.Source.ScreenShareAudio) {
      return this.audioPublications;
    }

    return null;
  }

  getPublication(trackSid: string): LocalTrackPublication | RemoteTrackPublication | undefined {
    const screenPublication = this.screenPublications.get(trackSid);
    const audioPublication = this.audioPublications.get(trackSid);

    return screenPublication || audioPublication;
  }

  clearPublications(): void {
    this.screenPublications.clear();
    this.audioPublications.clear();
  }

  private setPublication(
    publication: LocalTrackPublication | RemoteTrackPublication,
  ): LocalTrackPublication | RemoteTrackPublication {
    const { source } = publication;
    const publications = this.getPublications(source);

    if (publications) publications.set(publication.trackSid, publication);

    return publication;
  }

  private removePublication(trackSid: string): void {
    const screenPublication = this.screenPublications.get(trackSid);
    const audioPublication = this.audioPublications.get(trackSid);

    if (screenPublication) this.screenPublications.delete(trackSid);
    if (audioPublication) this.audioPublications.delete(trackSid);
  }

  private setSubscription(
    trackSid: string,
    track: LocalTrack | RemoteTrack,
    publication: LocalTrackPublication | RemoteTrackPublication,
  ): void {
    this.subscriptions.set(trackSid, { track, publication });
  }

  private removeSubscription(trackSid: string): void {
    this.subscriptions.delete(trackSid);
  }

  private getSubscription(trackSid: string): PublicationData | undefined {
    return this.subscriptions.get(trackSid);
  }

  private clearSubscriptions(): void {
    this.subscriptions.clear();
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

  private publicationEnded(publication: LocalTrackPublication | RemoteTrackPublication): void {
    if (!LiveKitScreenshareBridge.isScreenSharePublication(publication)) return;

    const { trackSid, source } = publication;

    if (this.role === SEND_ROLE) {
      logger.info({
        logCode: 'livekit_screenshare_unpublished',
        extraInfo: {
          bridgeName: BRIDGE_NAME,
          streamId: this.streamId,
          trackSid,
          role: this.role,
        },
      }, 'LiveKit: screen share unpublished');
    }

    // We only want to alert the user once when the screen share ends, so
    // only do it for the main screen share track (not the audio track)
    if (source === Track.Source.ScreenShare) screenShareEndAlert();
  }

  private handleTrackPublished(publication: LocalTrackPublication | RemoteTrackPublication): void {
    this.setPublication(publication);
  }

  private handleTrackUnpublished(publication: LocalTrackPublication | RemoteTrackPublication): void {
    const { trackSid } = publication;

    this.removePublication(trackSid);
    this.removeSubscription(trackSid);
    this.publicationEnded(publication);
  }

  private handleTrackSubscribed(
    track: LocalTrack | RemoteTrack,
    publication: LocalTrackPublication | RemoteTrackPublication,
  ): void {
    if (!LiveKitScreenshareBridge.isScreenShareTrack(track)) return;

    const { trackSid } = publication;
    this.setSubscription(trackSid, track, publication);
    if (trackSid === this.streamId) this.handleViewerStart(trackSid);
    logger.debug({
      logCode: 'livekit_screenshare_subscribed',
      extraInfo: {
        bridgeName: this.bridgeName,
        streamId: trackSid,
        role: this.role,
      },
    }, `LiveKit: screen share subscribed - ${trackSid}`);
  }

  private handleTrackUnsubscribed(
    track: LocalTrack | RemoteTrack,
    publication: LocalTrackPublication | RemoteTrackPublication,
  ): void {
    if (!LiveKitScreenshareBridge.isScreenShareTrack(track)) return;

    const { trackSid } = publication;
    this.removeSubscription(trackSid);
    logger.debug({
      logCode: 'livekit_screenshare_unsubscribed',
      extraInfo: {
        bridgeName: this.bridgeName,
        streamId: trackSid,
        role: this.role,
      },
    }, `LiveKit: screen share unsubscribed - ${trackSid}`);
  }

  private observeRoomEvents(): void {
    if (!this.liveKitRoom) return;
    this.removeRoomObservers();
    this.liveKitRoom.on(RoomEvent.TrackPublished, this.handleTrackPublished);
    this.liveKitRoom.on(RoomEvent.TrackUnpublished, this.handleTrackUnpublished);
    this.liveKitRoom.on(RoomEvent.LocalTrackUnpublished, this.handleTrackUnpublished);
    this.liveKitRoom.on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    this.liveKitRoom.on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);

    this.liveKitRoom.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        if (LiveKitScreenshareBridge.isScreenShareTrack(publication.track)) {
          this.setPublication(publication);

          if (publication.isSubscribed && publication.track) {
            this.setSubscription(publication.trackSid, publication.track, publication);
          }
        }
      });
    });
  }

  private removeRoomObservers(): void {
    if (!this.liveKitRoom) return;
    this.liveKitRoom.off(RoomEvent.TrackPublished, this.handleTrackPublished);
    this.liveKitRoom.off(RoomEvent.TrackUnpublished, this.handleTrackUnpublished);
    this.liveKitRoom.off(RoomEvent.LocalTrackUnpublished, this.handleTrackUnpublished);
    this.liveKitRoom.off(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    this.liveKitRoom.off(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    this.clearPublications();
    this.clearSubscriptions();
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
    // eslint-disable-next-line no-console
    console.error('The Bridge must implement getPeerConnection');
  }

  setVolume(volume: number): number {
    if (this.role === RECV_ROLE
      && typeof volume === 'number' && volume >= 0 && volume <= 1) {
      const audioPublications = Array.from(this.audioPublications.values());

      if (audioPublications.length > 0) {
        audioPublications.forEach((publication) => {
          const { track } = publication;

          // @ts-ignore
          if (track && track?.setVolume) track.setVolume(volume);
        });

        return volume;
      }
    }

    return DEFAULT_VOLUME;
  }

  getVolume(): number {
    const audioPublications = Array.from(this.audioPublications.values());

    if (audioPublications.length > 0) {
      const remote = audioPublications.find((publication) => {
        const { track } = publication;

        // @ts-ignore
        return track && track.setVolume;
      });

      if (remote) {
        // @ts-ignore
        return remote?.track?.volume;
      }
    }

    return DEFAULT_VOLUME;
  }

  handleViewerStart(streamId: string): void {
    const publicationData = this.getSubscription(streamId);

    if (publicationData && publicationData.track) {
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
        }, `LiveKit: screen attachment failed: ${(error as Error).message}`);
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
      }, `LiveKit: screen subscribe failed: ${error.message}`);
    };

    try {
      await this.waitForRoomConnection();

      const publication = this.getPublication(streamId);

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
    // @ts-ignore
    const LIVEKIT_SCREEN_SETTINGS = window.meetingClientSettings.public.media?.livekit?.screenshare;
    // @ts-ignore
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
