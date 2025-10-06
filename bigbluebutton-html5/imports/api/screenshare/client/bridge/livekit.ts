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
  ParticipantEvent,
  LocalTrackPublication,
  RemoteTrackPublication,
  LocalTrack,
  RemoteTrack,
  type TrackPublishOptions,
  VideoPreset,
  ScreenSharePresets,
} from 'livekit-client';
import {
  liveKitRoom,
  getLKStats,
} from '/imports/ui/services/livekit';
import { LiveKitPresetConfig } from 'imports/ui/Types/meetingClientSettings';

interface Options {
  hasAudio?: boolean;
  outputDeviceId?: string;
}

interface PublicationData {
  track: LocalTrack | RemoteTrack;
  publication: LocalTrackPublication | RemoteTrackPublication;
}

const BRIDGE_NAME = 'livekit';
const SCREENSHARE_VIDEO_TAG = 'screenshareVideo';
const SEND_ROLE = 'send';
const RECV_ROLE = 'recv';
const DEFAULT_VOLUME = 1;
const ROOM_CONNECTION_TIMEOUT = 15000;

const FALLBACK_PRESET_ORG_HIGH = new VideoPreset(1920, 1080, 2_000_000, 15, 'medium');

const getDefaultPresets = (mediaStream: MediaStream): VideoPreset[] => {
  const fallbackPresets = [FALLBACK_PRESET_ORG_HIGH];

  try {
    if (!mediaStream.getVideoTracks().length) return fallbackPresets;

    const { width = 1920, height = 1080 } = mediaStream.getVideoTracks()[0].getSettings();

    return [
      new VideoPreset(width, height, 2_000_000, 15, 'medium'),
    ];
  } catch (error) {
    logger.error({
      logCode: 'livekit_screenshare_get_presets_error',
      extraInfo: {
        errorName: (error as Error).name,
        errorMessage: (error as Error).message,
        errorStack: (error as Error).stack,
      },
    }, `LiveKit: failed to get screen share presets: ${(error as Error).message}`);

    return fallbackPresets;
  }
};

const assemblePresetFromConfig = (config: LiveKitPresetConfig): VideoPreset => {
  const {
    width,
    height,
    maxBitrate,
    maxFramerate,
    priority,
  } = config;

  return new VideoPreset(width, height, maxBitrate, maxFramerate, priority);
};

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

    this.handleLocalTrackPublished = this.handleLocalTrackPublished.bind(this);
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

  setStreamEnabled(enabled: boolean): void {
    if (this.gdmStream) {
      this.gdmStream.getTracks().forEach((track) => {
        // eslint-disable-next-line no-param-reassign
        track.enabled = enabled;
      });
    }
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

  hasPublication(trackSid: string): boolean {
    return this.screenPublications.has(trackSid) || this.audioPublications.has(trackSid);
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

    if (publications) {
      publications.set(publication.trackSid, publication);

      if (publication.trackSid === this.streamId && this.role === RECV_ROLE) {
        this.subscribe(publication as RemoteTrackPublication);
      }
    }

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

  private publicationEnded(publication: LocalTrackPublication | RemoteTrackPublication): void {
    if (!LiveKitScreenshareBridge.isScreenSharePublication(publication)) return;

    const { trackSid, source, trackName } = publication;

    if (this.role === SEND_ROLE) {
      logger.info({
        logCode: 'livekit_screenshare_unpublished',
        extraInfo: {
          bridgeName: BRIDGE_NAME,
          streamId: this.streamId,
          role: this.role,
          trackSid,
          trackName,
          streamData: MediaStreamUtils.getMediaStreamLogData(this.gdmStream),
        },
      }, `LiveKit: screen share unpublished - ${trackSid}`);
    }

    // We only want to alert the user once when the screen share ends, so
    // only do it for the main screen share track (not the audio track)
    if (source === Track.Source.ScreenShare) screenShareEndAlert();
  }

  private handleLocalTrackPublished(publication: LocalTrackPublication): void {
    if (!LiveKitScreenshareBridge.isScreenSharePublication(publication)) return;

    const { trackSid, trackName } = publication;

    logger.info({
      logCode: 'livekit_screenshare_published',
      extraInfo: {
        bridgeName: BRIDGE_NAME,
        streamId: this.streamId,
        role: this.role,
        trackSid,
        trackName,
        streamData: MediaStreamUtils.getMediaStreamLogData(this.gdmStream),
      },
    }, `LiveKit: screen share published - ${trackSid}`);
  }

  private handleTrackPublished(publication: LocalTrackPublication | RemoteTrackPublication): void {
    if (!LiveKitScreenshareBridge.isScreenSharePublication(publication)) return;

    this.setPublication(publication);
  }

  private handleTrackUnpublished(publication: LocalTrackPublication | RemoteTrackPublication): void {
    if (!LiveKitScreenshareBridge.isScreenSharePublication(publication)) return;

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

    const { trackSid, source, trackName } = publication;
    this.setSubscription(trackSid, track, publication);
    if (trackSid === this.streamId) this.handleViewerStart(trackSid);
    logger.debug({
      logCode: 'livekit_screenshare_subscribed',
      extraInfo: {
        bridgeName: this.bridgeName,
        streamId: this.streamId,
        trackSid,
        role: this.role,
        trackName,
        source,
      },
    }, `LiveKit: screen share subscribed - ${trackSid} (${source})`);
  }

  private handleTrackUnsubscribed(
    track: LocalTrack | RemoteTrack,
    publication: LocalTrackPublication | RemoteTrackPublication,
  ): void {
    if (!LiveKitScreenshareBridge.isScreenShareTrack(track)) return;

    const { trackSid, source, trackName } = publication;
    this.removeSubscription(trackSid);
    logger.debug({
      logCode: 'livekit_screenshare_unsubscribed',
      extraInfo: {
        bridgeName: this.bridgeName,
        streamId: this.streamId,
        role: this.role,
        trackSid,
        trackName,
        source,
      },
    }, `LiveKit: screen share unsubscribed - ${trackSid} (${source})`);
  }

  private findInitialRemotePublications(): void {
    if (!this.liveKitRoom) return;

    this.liveKitRoom.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        if (LiveKitScreenshareBridge.isScreenSharePublication(publication)) {
          this.handleTrackPublished(publication);
        }
      });
    });
  }

  private observeRoomEvents(): void {
    if (!this.liveKitRoom) return;

    this.removeRoomObservers();
    this.liveKitRoom.on(RoomEvent.TrackPublished, this.handleTrackPublished);
    this.liveKitRoom.on(RoomEvent.TrackUnpublished, this.handleTrackUnpublished);
    this.liveKitRoom.on(RoomEvent.LocalTrackUnpublished, this.handleTrackUnpublished);
    this.liveKitRoom.on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    this.liveKitRoom.on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    this.liveKitRoom.localParticipant.on(ParticipantEvent.LocalTrackPublished, this.handleLocalTrackPublished);
    this.findInitialRemotePublications();
  }

  private removeRoomObservers(): void {
    if (!this.liveKitRoom) return;

    this.liveKitRoom.off(RoomEvent.TrackPublished, this.handleTrackPublished);
    this.liveKitRoom.off(RoomEvent.TrackUnpublished, this.handleTrackUnpublished);
    this.liveKitRoom.off(RoomEvent.LocalTrackUnpublished, this.handleTrackUnpublished);
    this.liveKitRoom.off(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    this.liveKitRoom.off(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    this.liveKitRoom.localParticipant.off(ParticipantEvent.LocalTrackPublished, this.handleLocalTrackPublished);
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

  private unsubscribe(mainPublication: RemoteTrackPublication): void {
    if (this.role === RECV_ROLE) {
      // @ts-ignore
      const withSelectiveSubscription = window.meetingClientSettings.public.media?.livekit?.selectiveSubscription
        || false;
      const { track } = mainPublication;
      const mediaElement = document.getElementById(SCREENSHARE_VIDEO_TAG) as HTMLMediaElement;

      if (track) track.detach(mediaElement);

      if (withSelectiveSubscription) {
        const audioPublications = Array.from(this.audioPublications.values()) as RemoteTrackPublication[];

        if (audioPublications.length > 0) {
          audioPublications.forEach((publication) => {
            if (LiveKitScreenshareBridge.isScreenSharePublication(publication)) {
              publication.setSubscribed(false);
            }
          });
        }

        mainPublication.setSubscribed(false);
      }
    }
  }

  private subscribe(publication: RemoteTrackPublication): void {
    if (publication.isSubscribed) {
      this.handleViewerStart(publication.trackSid);
      return;
    }

    publication.setSubscribed(true);
  }

  // eslint-disable-next-line class-methods-use-this
  getPeerConnection() {
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  async getStats(): Promise<Map<string, unknown>> {
    return getLKStats();
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

    const doSubscribe = () => {
      this.findInitialRemotePublications();
      const publication = this.getPublication(streamId);

      if (!publication || !(publication instanceof RemoteTrackPublication)) {
        throw new Error('Publication not found');
      }

      this.subscribe(publication);
    };

    // If publication fails with "Publication not found" error, we will retry the subscription
    // with a slight delay as  client info might not be available immediately
    const delayedSubscription = () => new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          doSubscribe();
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });

    const handleInitError = (error: Error) => {
      logger.warn({
        logCode: 'livekit_screenshare_init_error',
        extraInfo: {
          errorMessage: error.message,
          errorName: error.name,
          errorStack: error.stack,
          bridgeName: this.bridgeName,
          role: this.role,
          streamId: this.streamId,
        },
      }, `LiveKit: screen subscribe failed: ${error.message}`);
    };

    try {
      await this.waitForRoomConnection();
      doSubscribe();
    } catch (error) {
      if ((error as Error).message === 'Publication not found') {
        try {
          await delayedSubscription();
        } catch (delayedError) {
          handleInitError(delayedError as Error);
        }
      } else {
        handleInitError(error as Error);
      }
    }
  }

  async share(stream: MediaStream, onFailure: (error: Error) => void, contentType: string): Promise<void> {
    // @ts-ignore
    const configScreenPubOpts = window.meetingClientSettings.public.media?.livekit?.screenshare?.publishOptions
      || {};
    const presets = window.meetingClientSettings.public.media?.livekit?.screenshare?.presets;
    const screenSharePresets = presets
      ? presets.map((preset: LiveKitPresetConfig) => assemblePresetFromConfig(preset))
      : getDefaultPresets(stream);
    const screenShareEncoding = screenSharePresets[screenSharePresets.length - 1]?.encoding
      || ScreenSharePresets.h1080fps15.encoding;
    // @ts-ignore
    const configAudioPubOpts = window.meetingClientSettings.public.media?.livekit?.audio?.publishOptions || {};
    const baseAudioOptions: TrackPublishOptions = {
      audioPreset: AudioPresets.speech,
      dtx: true,
      red: false,
      forceStereo: false,
      ...configAudioPubOpts,
    };
    const baseVideoOptions: TrackPublishOptions = {
      videoCodec: 'vp8',
      simulcast: true,
      screenShareEncoding,
      ...configScreenPubOpts,
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
          streamId: this.streamId,
          contentType,
          streamData: MediaStreamUtils.getMediaStreamLogData(stream),
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
            name: `${Auth.userID}-${contentType}-${track.kind}`,
          };

          return () => this.liveKitRoom.localParticipant.publishTrack(track, publishOptions);
        });

      this.waitForRoomConnection()
        .then(() => Promise.all(publishers.map((publish) => publish())))
        .catch(handleInitError);
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
            streamId: this.streamId,
          },
        }, 'Failed to exit screenshare');
      }
    } else if (this.role === RECV_ROLE && this.streamId) {
      const publication = this.getPublication(this.streamId) as RemoteTrackPublication;

      if (publication) this.unsubscribe(publication);
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
