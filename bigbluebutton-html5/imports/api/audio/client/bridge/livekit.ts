import {
  AudioPresets,
  ConnectionState,
  DisconnectReason,
  Track,
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
import {
  getAudioConstraints,
  filterSupportedConstraints,
  destroyWasmProcessor,
  doGUM,
  isWasmProcessingEnabled,
} from '/imports/api/audio/client/bridge/service';
import {
  liveKitRoomRegistry,
  waitForRoomConnection,
  LK_FATAL_ERROR_EVENT,
  PRIMARY_KEY,
  type LiveKitFatalErrorDetail,
  type MembershipKey,
} from '/imports/ui/services/livekit';
import { getLiveKitStats } from '/imports/ui/services/livekit/stats';
import MediaStreamUtils from '/imports/utils/media-stream-utils';

const BRIDGE_NAME = 'livekit';
const SENDRECV_ROLE = 'sendrecv';
const PUBLISH_OP = 'publish';
const UNPUBLISH_OP = 'unpublish';
const DEFAULT_UNPUBLISH_AFTER_MUTE_MS = 5000;

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

  // Audio output (sink) id, written by AudioManager; applied to every
  // registry room, including rooms that connect later.
  public outputDeviceId: string | null;

  private primaryRoom: Room | undefined;

  private secondaryRoom: Room | undefined;

  private activeMicRoom: Room | undefined;

  // Membership key of activeMicRoom, tracked so fatal-publish errors can be
  // dispatched keyed to the exact room BaseLiveKitRoom is publishing to.
  private activeMicRoomKey: MembershipKey;

  private currentMicTrack: MediaStreamTrack | undefined;

  private joinInFlight: boolean;

  private pendingMicSwitch: { room: Room; key: MembershipKey } | null;

  // Mic-switch generation: each room switch captures the gen and abandons
  // after any async procedure if superseded, so interleaved room switches
  // never land a publish on a stale room.
  private micSwitchGeneration: number;

  private readonly role: string;

  private callback: (args: { status: string; bridge: string }) => void;

  private publishQueue: Array<PublishQueueItem>;

  private isProcessingPublishQueue: boolean;

  private clientSessionUUID: string = '0';

  private unpublishRequest: ReturnType<typeof setTimeout> | null;

  // Tracks whether a publish operation is pending
  // Used for idempotency checks since LiveKit's actual state is not immediate
  private isPublishPending: boolean;

  // Generation counter for publish operations. Used to prevent stale finally()
  // callbacks from incorrectly clearing isPublishPending when a newer publish
  // has superseded them.
  private publishGeneration: number;

  // Desired mute state, mirroring the last mute/unmute intent applied via
  // setSenderTrackEnabled.
  private shouldBeMuted: boolean;

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
    this.primaryRoom = liveKitRoomRegistry.getPrimary();
    this.activeMicRoom = this.primaryRoom;
    this.activeMicRoomKey = PRIMARY_KEY;
    this.secondaryRoom = undefined;
    this.currentMicTrack = undefined;
    this.joinInFlight = false;
    this.pendingMicSwitch = null;
    this.micSwitchGeneration = 0;
    this.outputDeviceId = null;
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
    this.handleRoomReconnected = this.handleRoomReconnected.bind(this);
    this.unpublishRequest = null;
    this.isPublishPending = false;
    this.publishGeneration = 0;
    this.shouldBeMuted = true;

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

  private resolvePrimaryRoom(): Room | undefined {
    if (!this.primaryRoom) {
      this.primaryRoom = liveKitRoomRegistry.getPrimary();
      if (this.primaryRoom && !this.activeMicRoom) {
        this.activeMicRoom = this.primaryRoom;
      }
    }

    return this.primaryRoom;
  }

  async attachSecondaryRoom(secondaryRoom: Room, membershipKey: MembershipKey): Promise<void> {
    this.secondaryRoom = secondaryRoom;

    // A mic-room switch during an in-flight join re-points the mic before the
    // session exists and can strand the join (reload-mid-listen mounts the
    // secondary while audio auto-rejoins). Defer the switch; joinAudio applies
    // it once the session is up.
    if (this.joinInFlight) {
      this.pendingMicSwitch = { room: secondaryRoom, key: membershipKey };
    } else {
      await this.setActiveMicRoom(this.secondaryRoom, membershipKey);
    }

    await this.applyOutputDeviceToRoom(secondaryRoom);
  }

  async detachSecondaryRoom(): Promise<void> {
    this.secondaryRoom = undefined;
    const primaryRoom = this.resolvePrimaryRoom();

    if (this.joinInFlight) {
      if (primaryRoom) this.pendingMicSwitch = { room: primaryRoom, key: PRIMARY_KEY };
      return;
    }

    await this.setActiveMicRoom(primaryRoom, PRIMARY_KEY);
  }

  // Runs a mic-room switch that was deferred because a join was in flight.
  private async applyPendingMicSwitch(): Promise<void> {
    const pending = this.pendingMicSwitch;
    this.pendingMicSwitch = null;

    if (!pending) return;

    try {
      await this.setActiveMicRoom(pending.room, pending.key);
    } catch (error) {
      logger.error({
        logCode: 'livekit_audio_pending_mic_switch_failed',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          errorStack: (error as Error).stack,
          bridge: this.bridgeName,
          role: this.role,
        },
      }, 'LiveKit: deferred mic-room switch failed');
    }
  }

  private async setActiveMicRoom(
    target: Room | undefined,
    targetKey: MembershipKey,
  ): Promise<void> {
    if (!target || target === this.activeMicRoom) return;

    this.micSwitchGeneration += 1;
    const generation = this.micSwitchGeneration;
    const previous = this.activeMicRoom;
    const hadMic = this.isInMicrophoneAudio();

    this.activeMicRoom = target;
    this.activeMicRoomKey = targetKey;

    // Rehome audio observers so mute defenses act on the room the mic now lives in.
    this.rehomeMicObservers(previous, target);

    // Only a live mic is migrated betwen rooms when switching (see
    // isInMicrophoneAudio); otherwise, just switch rooms.
    if (previous && hadMic) {
      try {
        // Unpublish WITHOUT stopping the track so the same MediaStreamTrack can
        // be republished into the new room without gUM
        const pub = previous.localParticipant.getTrackPublication(Track.Source.Microphone);

        if (pub?.track) await previous.localParticipant.unpublishTrack(pub.track, false);
      } catch (error) {
        logger.warn({
          logCode: 'lk_audio_unpublish_on_switch_failed',
          extraInfo: {
            errorMessage: (error as Error).message,
            errorName: (error as Error).name,
            errorStack: (error as Error).stack,
            bridge: this.bridgeName,
            role: this.role,
          },
        }, 'LiveKit: unpublish-on-switch failed');
      }
    }

    // Generation superseded - abandon
    if (this.micSwitchGeneration !== generation) return;

    if (!hadMic) {
      logger.debug({
        logCode: 'livekit_audio_mic_switch_no_active_mic',
        extraInfo: {
          bridge: this.bridgeName,
          role: this.role,
          activeMicRoomKey: this.activeMicRoomKey,
          inputDeviceId: this.inputDeviceId,
        },
      }, 'LiveKit: mic-room switch recorded target without publishing (not in microphone audio)');
      return;
    }

    try {
      // force=true supersedes any pending publish so the switch always lands.
      await this.publish(this.originalStream, true);

      // Generation superseded - abandon
      if (this.micSwitchGeneration !== generation) return;

      this.reinforceMuteState('mic_room_switch');
    } catch (error) {
      logger.error({
        logCode: 'lk_audio_publish_on_switch_failed',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          errorStack: (error as Error).stack,
          bridge: this.bridgeName,
          role: this.role,
        },
      }, 'LiveKit: publish-on-switch failed');
    }
  }

  // A publish targets one specific room, but the publish queue is serial: if the
  // target room dies mid-publish the SDK call stays pending for its own internal
  // timeout and every later operation.
  // Bind the call to the target's liveness so the queue is unclogged the moment
  // publishing becomes pointless.
  private static bindToRoomLiveness<T>(room: Room, operation: Promise<T>): Promise<T> {
    if (room.state === ConnectionState.Disconnected) {
      return Promise.reject(new Error('Room disconnected before publishing'));
    }

    return new Promise<T>((resolve, reject) => {
      const onDisconnected = (reason?: DisconnectReason) => {
        reject(new Error(`Room disconnected while publishing (reason=${reason})`));
      };

      room.once(RoomEvent.Disconnected, onDisconnected);
      operation.then(resolve, reject).finally(() => {
        room.off(RoomEvent.Disconnected, onDisconnected);
      });
    });
  }

  private async applyOutputDeviceToRoom(room: Room): Promise<void> {
    const deviceId = this.outputDeviceId;

    if (!deviceId) return;

    try {
      await waitForRoomConnection(room);
      await room.switchActiveDevice('audiooutput', deviceId, true);
    } catch (error) {
      logger.warn({
        logCode: 'livekit_audio_output_device_room_apply_failed',
        extraInfo: {
          bridge: this.bridgeName,
          role: this.role,
          deviceId,
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
          errorStack: (error as Error).stack,
        },
      }, 'LiveKit: failed to apply output device to room');
    }
  }

  private getLocalMicTrackPubs(): LocalTrackPublication[] {
    const room = this.activeMicRoom ?? this.resolvePrimaryRoom();

    if (!room) return [];

    return Array.from(
      room.localParticipant.audioTrackPublications.values(),
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

  private static isFatalPublishError(error: Error): boolean {
    return error.name === 'ConnectionError'
      && error.message?.includes('timed out');
  }

  private isLocalPublicationMuted(): boolean {
    const pubs = this.getLocalMicTrackPubs();

    return pubs.every((pub) => pub.isMuted);
  }

  private isTrackPublishedWithStream(stream: MediaStream | null): boolean {
    if (!stream) return false;

    const pubs = this.getLocalMicTrackPubs();

    if (pubs.length === 0) return false;

    return pubs.some((pub) => {
      const pubStream = pub.track?.mediaStream;

      return pubStream?.id === stream.id && pubStream?.active;
    });
  }

  private clearUnpublishRequest(): void {
    if (this.unpublishRequest) {
      clearTimeout(this.unpublishRequest);
      this.unpublishRequest = null;
    }
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

    // @ts-ignore
    const LIVEKIT_SETTINGS = window.meetingClientSettings.public.media?.livekit?.audio;
    const unpublishAfterMuteMs = LIVEKIT_SETTINGS?.unpublishAfterMuteMs ?? DEFAULT_UNPUBLISH_AFTER_MUTE_MS;
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

    if (LIVEKIT_SETTINGS?.unpublishOnMute && this.hasMicrophoneTrack()) {
      this.clearUnpublishRequest();

      this.unpublishRequest = setTimeout(() => {
        // If the publication is unmuted, we don't need to unpublish anymore
        // (this unpublish request is only set if the publication is muted)
        if (!this.hasMicrophoneTrack() || !this.isLocalPublicationMuted()) return;

        this.unpublish();
        this.unpublishRequest = null;
      }, unpublishAfterMuteMs);
    }
  }

  private handleLocalTrackUnmuted(publication: TrackPublication): void {
    if (!LiveKitAudioBridge.isMicrophonePublication(publication)) return;

    const { trackSid, isMuted, trackName } = publication;

    this.clearUnpublishRequest();

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

    // The server is not notified of a track-level unmute, so if BBB's state is
    // muted we must re-mute here to reconcile states.
    this.reinforceMuteState('local_track_unmuted');
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

    // A (re)published track comes up unmuted (e.g. reconnect republish or a
    // fresh publish racing a mute). Reinforce the muted state if that is the
    // intent so audio never flows while the user is meant to be muted.
    this.reinforceMuteState('local_track_published');
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

  private handleRoomReconnected(): void {
    // A full reconnect republishes local tracks using the SDK's local mute
    // state, which may have drifted from BBB's authoritative state. Reinforce.
    this.reinforceMuteState('room_reconnected');
  }

  // Re-assert the desired muted state onto the local microphone track. LiveKit
  // reconnects/republishes, and out-of-band track unmutes, can leave the track
  // sending audio while BBB's state is muted.
  private reinforceMuteState(reason: string): void {
    if (!this.shouldBeMuted) return;
    if (!this.hasMicrophoneTrack() || this.isLocalPublicationMuted()) return;

    logger.warn({
      logCode: 'livekit_audio_mute_reinforced',
      extraInfo: {
        bridge: this.bridgeName,
        role: this.role,
        reason,
      },
    }, `LiveKit: reinforcing muted state on local audio track - ${reason}`);

    const micRoom = this.activeMicRoom ?? this.resolvePrimaryRoom();

    if (!micRoom) return;

    micRoom.localParticipant.setMicrophoneEnabled(false).catch((error) => {
      logger.error({
        logCode: 'livekit_audio_mute_reinforce_error',
        extraInfo: {
          errorMessage: (error as Error)?.message,
          errorName: (error as Error)?.name,
          errorStack: (error as Error)?.stack,
          bridge: this.bridgeName,
          role: this.role,
          reason,
        },
      }, `LiveKit: failed to reinforce muted state - ${(error as Error)?.message}`);
    });
  }

  private observeLiveKitEvents(): void {
    const primary = this.resolvePrimaryRoom();
    const micRoom = this.activeMicRoom ?? primary;

    if (primary) this.attachStaticObservers(primary);
    if (micRoom) this.attachMicObservers(micRoom);
  }

  private attachStaticObservers(room: Room): void {
    room.off(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    room.off(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    room.off(RoomEvent.TrackSubscriptionFailed, this.handleTrackSubscriptionFailed);
    room.off(RoomEvent.TrackSubscriptionStatusChanged, this.handleTrackSubscriptionStatusChanged);
    room.on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    room.on(RoomEvent.TrackSubscriptionFailed, this.handleTrackSubscriptionFailed);
    room.on(RoomEvent.TrackSubscriptionStatusChanged, this.handleTrackSubscriptionStatusChanged);
  }

  // Listeners that must track wherever the local mic is published (mute
  // defenses + publish logging).
  private attachMicObservers(room: Room): void {
    this.detachMicObservers(room);
    room.on(RoomEvent.Reconnected, this.handleRoomReconnected);
    room.localParticipant.on(ParticipantEvent.TrackMuted, this.handleLocalTrackMuted);
    room.localParticipant.on(ParticipantEvent.TrackUnmuted, this.handleLocalTrackUnmuted);
    room.localParticipant.on(ParticipantEvent.LocalTrackPublished, this.handleLocalTrackPublished);
    room.localParticipant.on(ParticipantEvent.LocalTrackUnpublished, this.handleLocalTrackUnpublished);
  }

  private detachMicObservers(room: Room): void {
    room.off(RoomEvent.Reconnected, this.handleRoomReconnected);
    room.localParticipant.off(ParticipantEvent.TrackMuted, this.handleLocalTrackMuted);
    room.localParticipant.off(ParticipantEvent.TrackUnmuted, this.handleLocalTrackUnmuted);
    room.localParticipant.off(ParticipantEvent.LocalTrackPublished, this.handleLocalTrackPublished);
    room.localParticipant.off(ParticipantEvent.LocalTrackUnpublished, this.handleLocalTrackUnpublished);
  }

  private rehomeMicObservers(previous: Room | undefined, target: Room): void {
    if (previous === target) return;
    if (previous) this.detachMicObservers(previous);

    this.attachMicObservers(target);
  }

  private handleFatalPublishError(error: Error): void {
    logger.error({
      logCode: 'livekit_audio_fatal_publish_error_reconnect',
      extraInfo: {
        errorMessage: error?.message,
        errorName: error?.name,
        errorStack: error?.stack,
        bridge: this.bridgeName,
        role: this.role,
        inputDeviceId: this.inputDeviceId,
        streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
      },
    }, 'LiveKit: fatal audio publish error detected, triggering reconnection');

    const detail: LiveKitFatalErrorDetail = {
      key: this.activeMicRoomKey,
      source: 'audio',
      error,
    };
    window.dispatchEvent(new CustomEvent(LK_FATAL_ERROR_EVENT, { detail }));
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
    const originalStreamAlive = !!this.originalStream?.active
      && this.originalStream.getAudioTracks().some((t) => t.readyState === 'live');

    if ((!stream
      || this.originalStream?.id === stream.id
      || (streamDeviceId === originalDeviceId && originalStreamAlive))
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
        streamDeviceId,
        originalDeviceId,
        resolvedDeviceId: newDeviceId,
        force: options?.force,
        wasmProcessingEnabled: isWasmProcessingEnabled(),
      },
    }, 'LiveKit: set audio input stream');

    if (hasCurrentPub) {
      // Force publish to supersede any pending publish with the new stream.
      // This is intentional - when changing the input stream, we want the new
      // one to take precedence over any ongoing publish.
      return this.publish(stream, true).catch((error) => {
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

    // This means we're switching to listen-only mode (i.e.: no input device)
    // Remove all input audio tracks from the stream, then return.
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
    const hasPublishedTrack = trackPubs.length > 0;
    const wasmEnabled = isWasmProcessingEnabled();

    if (hasPublishedTrack && wasmEnabled) {
      // WASM + published track: LiveKit's switchActiveDevice/restartTrack do
      // their own getUserMedia internally, bypassing doGUM — the new track
      // would be published raw (unprocessed). Instead, create a new
      // WASM-processed stream via doGUM and use replaceTrack to seamlessly
      // swap the underlying MediaStreamTrack without unpublish/republish
      try {
        const constraints = { audio: getAudioConstraints({ deviceId }) };

        backup();
        newStream = await doGUM(constraints);
        const newAudioTrack = newStream?.getAudioTracks()[0];
        const localTrack = this.publicationTrack;

        if (!newStream || !localTrack || !newAudioTrack) {
          throw new Error('LiveKit: missing local track or new audio track for WASM replaceTrack');
        }

        await localTrack.replaceTrack(newAudioTrack);
        this.inputDeviceId = deviceId;
        this.originalStream = newStream;
        cleanup();

        logger.debug({
          logCode: 'livekit_audio_live_change_wasm_replace_track',
          extraInfo: {
            bridge: this.bridgeName,
            role: this.role,
            requestedDeviceId: deviceId,
            inputDeviceId: this.inputDeviceId,
            newStreamData: MediaStreamUtils.getMediaStreamLogData(newStream),
            wasmProcessingEnabled: wasmEnabled,
          },
        }, 'LiveKit: WASM device switch via replaceTrack');

        return this.inputStream;
      } catch (error) {
        logger.error({
          logCode: 'livekit_audio_live_change_wasm_replace_error',
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
        }, 'LiveKit: WASM replaceTrack device switch failed');
        await rollback();
        throw error;
      }
    } else if (hasPublishedTrack) {
      // No WASM, published track: use LiveKit's own switchActiveDevice or
      // restartTrack for in-place device switching.
      try {
        // Backup stream (current one) in case the switch fails
        backup();

        // We have a published track, but it's stream is inactive. Likely a dead
        // stream or muted. Restart the track as switchActiveDevice will not work.
        if ((this.publicationTrackStream && !this.publicationTrackStream.active)
          || this.publicationTrack?.isMuted) {
          logger.warn({
            logCode: 'livekit_audio_live_change_input_device_inactive_stream',
            extraInfo: {
              bridge: this.bridgeName,
              role: this.role,
              deviceId,
              muted: this.publicationTrack?.isMuted,
              streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
              originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
              publicationStreamData: MediaStreamUtils.getMediaStreamLogData(this.publicationTrackStream),
              backupStreamData: MediaStreamUtils.getMediaStreamLogData(backupStream),
            },
          }, 'LiveKit: publication track stream is inactive before device switch');

          const track = this.publicationTrack;

          if (track) await track.restartTrack(getAudioConstraints({ deviceId }));
        } else {
          const switched = await (this.activeMicRoom ?? this.resolvePrimaryRoom())?.switchActiveDevice('audioinput', deviceId, true);

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
      // No published track (muted). Get a new stream via doGUM and set it
      // as the input stream — publish will happen on unmute.
      try {
        const constraints = {
          audio: getAudioConstraints({ deviceId }),
        };

        // Backup stream (current one) in case the switch fails
        backup();
        newStream = await doGUM(constraints);
        await this.setInputStream(newStream, { deviceId });
        cleanup();

        logger.debug({
          logCode: 'livekit_audio_live_change_no_pub_result',
          extraInfo: {
            bridge: this.bridgeName,
            requestedDeviceId: deviceId,
            originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
            newStreamData: MediaStreamUtils.getMediaStreamLogData(newStream),
            inputDeviceId: this.inputDeviceId,
            wasmProcessingEnabled: isWasmProcessingEnabled(),
          },
        }, 'LiveKit: device change completed (no existing publication)');

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
    // Record the latest mute intent so reconnect/republish/out-of-band track
    // unmutes can be reconciled against it (see reinforceMuteState).
    this.shouldBeMuted = !shouldEnable;
    const trackPubs = this.getLocalMicTrackPubs();
    const isCurrentlyMuted = this.isLocalPublicationMuted();
    const hasPublishedTrack = this.hasMicrophoneTrack();

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

    logger.debug({
      logCode: 'livekit_audio_set_sender_track_enabled',
      extraInfo: {
        shouldEnable,
        bridge: this.bridgeName,
        role: this.role,
        isCurrentlyMuted,
        hasPublishedTrack,
        isPublishPending: this.isPublishPending,
        inputDeviceId: this.inputDeviceId,
        streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
        originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
      },
    }, `LiveKit: setSenderTrackEnabled(${shouldEnable}) muted=${isCurrentlyMuted} published=${hasPublishedTrack}`);

    if (shouldEnable) {
      // If track is already published and unmuted, do nothing
      if (hasPublishedTrack && !isCurrentlyMuted) return;

      // Cancel any pending unpublish request since we're unmuting
      this.clearUnpublishRequest();

      const trackName = LiveKitAudioBridge.assembleTrackName(this.clientSessionId, this.inputDeviceId);
      const currentPubs = trackPubs.filter(
        (pub) => LiveKitAudioBridge.publicationMatchesDevice(pub, this.inputDeviceId),
      );

      // Track is published but muted - just unmute it
      if (currentPubs.length > 0) {
        const mutedPubs = currentPubs.filter((pub) => pub.isMuted);

        if (mutedPubs.length > 0) {
          mutedPubs.forEach((pub) => pub.unmute());
          logger.debug({
            logCode: 'livekit_audio_track_unmute',
            extraInfo: {
              bridge: this.bridgeName,
              role: this.role,
              trackName,
              streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
              originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
              mutedPubs: mutedPubs.map((pub) => pub.trackName),
            },
          }, `LiveKit: unmuting audio track - ${trackName}`);
        }
      } else if (trackPubs.length === 0 && this.originalStream) {
        // Track was unpublished on previous mute toggle, so publish again.
        // Only publish if we have an original stream (audio was shared before).
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
            hasPublishedTrack,
            isCurrentlyMuted,
            streamData: MediaStreamUtils.getMediaStreamLogData(this.inputStream),
            originalStreamData: MediaStreamUtils.getMediaStreamLogData(this.originalStream),
          },
        }, 'LiveKit: audio track unmute no-op - no matching pubs or no original stream');
      }
    } else {
      if (isCurrentlyMuted || !hasPublishedTrack) return;

      // Track is published and unmuted - mute it
      // The handleLocalTrackMuted callback will handle the debounced unpublish
      this.activeMicRoom?.localParticipant.setMicrophoneEnabled(false).catch(handleMuteError);
    }
  }

  async changeOutputDevice(deviceId: string): Promise<void> {
    this.outputDeviceId = deviceId;

    const primary = this.resolvePrimaryRoom();

    if (!primary) {
      logger.warn({
        logCode: 'livekit_audio_change_output_no_room',
        extraInfo: { bridge: this.bridgeName, role: this.role, deviceId },
      }, 'LiveKit: changeOutputDevice called but primary room unavailable');
      return;
    }

    await Promise.all(liveKitRoomRegistry.getRooms().map(async (room) => {
      try {
        const switched = await room.switchActiveDevice('audiooutput', deviceId, true);

        // Primary room device switch is authoritative (failures surface to end user).
        // Secondaries are best-effort.
        if (!switched && room === primary) throw new Error('Failed to switch audio output device');
      } catch (error) {
        if (room === primary) throw error;

        logger.warn({
          logCode: 'livekit_audio_change_output_device_secondary_error',
          extraInfo: {
            errorMessage: (error as Error).message,
            errorName: (error as Error).name,
            errorStack: (error as Error).stack,
            bridge: this.bridgeName,
            role: this.role,
            deviceId,
          },
        }, 'LiveKit: change audio output device failed on secondary room');
      }
    })).then(() => {
      const activeDevices = Array.from(
        primary.localParticipant.activeDeviceMap.entries(),
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
    }).catch((error) => {
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
    });
  }

  private hasMicrophoneTrack(): boolean {
    const tracks = this.getLocalMicTrackPubs();

    return tracks.length > 0;
  }

  private isInMicrophoneAudio(): boolean {
    if (this.inputDeviceId === 'listen-only') return false;

    // Track presence alone is not a reliable "in mic audio" signal during room
    // transitions: a room dying under the bridge (e.g. a breakout deleted
    // server-side mid-listen) kills the published track before the switch-back
    // runs. Fall back to session intent - an unmuted session holding an input
    // stream is still in microphone audio even if its track just died, and the
    // publish path re-acquires a capture for inactive streams.
    return !!this.currentMicTrack || (!this.shouldBeMuted && !!this.originalStream);
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

  private publish(inputStream: MediaStream | null, force = false): Promise<void> {
    // If the stream is already published and active, skip
    if (inputStream && this.isTrackPublishedWithStream(inputStream)) {
      logger.debug({
        logCode: 'livekit_audio_publish_idempotent_skip',
        extraInfo: {
          bridge: this.bridgeName,
          role: this.role,
          inputDeviceId: this.inputDeviceId,
          streamData: MediaStreamUtils.getMediaStreamLogData(inputStream),
        },
      }, 'LiveKit: stream already published, skipping publish');

      return Promise.resolve();
    }

    // If a publish is already pending and this isn't a forced supersede, skip.
    // This prevents multiple publish operations from being queued when calls
    // arrive faster than LiveKit can process them.
    if (this.isPublishPending && !force) {
      logger.debug({
        logCode: 'livekit_audio_publish_pending_skip',
        extraInfo: {
          bridge: this.bridgeName,
          role: this.role,
          inputDeviceId: this.inputDeviceId,
          streamData: MediaStreamUtils.getMediaStreamLogData(inputStream),
        },
      }, 'LiveKit: publish already pending, skipping');

      return Promise.resolve();
    }

    // The counter  prevents stale finally() callbacks from incorrectly clearing
    // isPublishPending when a newer publish has superseded them - prlanzarin
    this.publishGeneration += 1;
    const currentGeneration = this.publishGeneration;
    this.isPublishPending = true;

    return new Promise<void>((resolve, reject) => {
      // Discard trailing, unprocessed publish requests.
      this.flushPublishQueue(PUBLISH_OP);
      this.dispatchPublishOperation({
        type: PUBLISH_OP,
        stream: inputStream,
        deviceId: this.inputDeviceId,
        resolve,
        reject,
      });
    }).finally(() => {
      // Only clear pending if no newer publish has started
      if (this.publishGeneration === currentGeneration) this.isPublishPending = false;
    });
  }

  private unpublish(): Promise<void> {
    if (!this.hasMicrophoneTrack()) return Promise.resolve();

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
    // Bind fatal-error handling to the switch state this publish started
    // under: a mic-room switch superseding us mid-await means the failure
    // belongs to an abandoned room, and dispatching would reconnect the
    // CURRENT room instead.
    const switchGeneration = this.micSwitchGeneration;
    // If the stream is already published, skip the publish
    // This prevents unnecessary unpublish/publish cycles when doPublish is called directly
    if (inputStream && this.isTrackPublishedWithStream(inputStream)) {
      logger.debug({
        logCode: 'livekit_audio_do_publish_idempotent_skip',
        extraInfo: {
          bridge: this.bridgeName,
          role: this.role,
          inputDeviceId: this.inputDeviceId,
          streamData: MediaStreamUtils.getMediaStreamLogData(inputStream),
        },
      }, 'LiveKit: stream already published, skipping doPublish');

      return;
    }

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
        audioPreset: AudioPresets.musicHighQuality,
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

      const micRoom = this.activeMicRoom ?? this.resolvePrimaryRoom();

      if (!micRoom) {
        logger.warn({
          logCode: 'livekit_audio_publish_no_room',
          extraInfo: { bridge: this.bridgeName, role: this.role },
        }, 'LiveKit: doPublish called but no active mic room available');

        return;
      }

      // A room switch may still be establishing the target room's WebRTC conn
      // when this runs. Wait for room conn here.
      await waitForRoomConnection(micRoom);

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
            return micRoom.localParticipant.publishTrack(track, publishOptions);
          });
        await LiveKitAudioBridge.bindToRoomLiveness(micRoom, Promise.all(trackPublishers));
      } else {
        await LiveKitAudioBridge.bindToRoomLiveness(
          micRoom,
          micRoom.localParticipant.setMicrophoneEnabled(true, constraints, publishOptions),
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

      // Track the published mic track for room switching
      const micPub = micRoom.localParticipant.getTrackPublication(Track.Source.Microphone);
      this.currentMicTrack = micPub?.track?.mediaStreamTrack ?? undefined;

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

      if (LiveKitAudioBridge.isFatalPublishError(error as Error)) {
        if (this.micSwitchGeneration === switchGeneration) {
          this.handleFatalPublishError(error as Error);
        } else {
          logger.warn({
            logCode: 'livekit_audio_stale_fatal_publish_skip',
            extraInfo: {
              errorMessage: (error as Error).message,
              errorName: (error as Error).name,
              bridge: this.bridgeName,
              role: this.role,
            },
          }, 'LiveKit: fatal publish error on a superseded mic-room switch, skipping reconnect');
        }
      }

      throw error;
    }
  }

  private async doUnpublish(): Promise<void> {
    const micTrackPublications = this.getLocalMicTrackPubs();

    if (!micTrackPublications || micTrackPublications.length === 0) return;

    const micRoom = this.activeMicRoom ?? this.resolvePrimaryRoom();
    const unpublishers = micTrackPublications.map((publication: LocalTrackPublication) => {
      if (publication?.track && publication?.source === Track.Source.Microphone && micRoom) {
        const stopOnUnpublish = micRoom.options?.stopLocalTrackOnUnpublish ?? false;

        return micRoom.localParticipant.unpublishTrack(publication.track, stopOnUnpublish);
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
      this.currentMicTrack = undefined;
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

  // eslint-disable-next-line class-methods-use-this
  getPeerConnection(): RTCPeerConnection | null {
    return null;
  }

  async getStats(additionalStatsTypes = []):
    Promise<{ transportStats: object, [key: string]: string | number | object | unknown }> {
    const room = this.resolvePrimaryRoom();

    if (!room) return this.parseStats({ stats: new Map<string, unknown>(), additionalStatsTypes });

    const stats = await getLiveKitStats({
      room,
      kind: 'audio',
      source: Track.Source.Microphone,
      aggregateInbound: true,
    });
    return this.parseStats({ stats, additionalStatsTypes });
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
      this.joinInFlight = true;
      await waitForRoomConnection(this.resolvePrimaryRoom());
      this.originalStream = inputStream;
      this.shouldBeMuted = muted;

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
    } finally {
      this.joinInFlight = false;
      await this.applyPendingMicSwitch();
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

      if (this.inputDeviceId) {
        // exact, as getAudioConstraints does everywhere else. doGUM will handle
        // fallbacks if necessary.
        // @ts-ignore - deviceId is a valid MediaTrackConstraints member
        matchConstraints.deviceId = { exact: this.inputDeviceId };
      }

      const newStream = await doGUM({ audio: matchConstraints });
      const newAudioTrack = newStream?.getAudioTracks()[0];
      const localTrack = this.publicationTrack;

      if (!newStream || !newAudioTrack) {
        throw new Error('LiveKit: no audio track acquired for constraint update');
      }

      // Align the new track before it can reach a sender: LiveKit only does so
      // after handing it over, and setInputStream below may publish it as-is.
      // Muted if either source says so - shouldBeMuted is BBB's intent and the only
      // one left when nothing is published, and it leads isMuted while an unmute is
      // still in flight.
      newAudioTrack.enabled = !(this.shouldBeMuted || localTrack?.isMuted);

      // replaceTrack needs an active RTCRtpSender; a publication without a attached
      // track would throw (and that may happen). Treat as unpublished.
      if (!localTrack?.sender) {
        // Nothing published, swap the stream only.
        await this.setInputStream(newStream, { deviceId: this.inputDeviceId, force: true });
        return;
      }

      const previousStream = this.originalStream;

      try {
        await localTrack.replaceTrack(newAudioTrack);
      } catch (replaceError) {
        // This is not really recoverable. The previous pub should still be working,
        // though - so bubble the error up.
        // newStream never becomes this.originalStream here, so AudioManager's
        // post-update cleanup will not see it: release the processor as well as
        // the tracks, or its AudioContext and worklet outlive the failed swap.
        destroyWasmProcessor(newStream);
        MediaStreamUtils.stopMediaStreamTracks(newStream);
        throw replaceError;
      }

      this.originalStream = newStream;
      logger.debug({
        logCode: 'livekit_audio_constraints_replace_track',
        extraInfo: {
          bridge: this.bridgeName,
          role: this.role,
          inputDeviceId: this.inputDeviceId,
          constraints: matchConstraints,
          newStreamData: MediaStreamUtils.getMediaStreamLogData(newStream),
          previousStreamData: MediaStreamUtils.getMediaStreamLogData(previousStream),
          wasmProcessingEnabled: isWasmProcessingEnabled(),
        },
      }, 'LiveKit: audio constraints applied via replaceTrack');
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
    const micRoom = this.activeMicRoom ?? this.resolvePrimaryRoom();
    const disableMic = micRoom
      ? micRoom.localParticipant.setMicrophoneEnabled(false)
      : Promise.resolve(false);

    return disableMic
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
        this.currentMicTrack = undefined;
        this.isPublishPending = false;
        this.pendingMicSwitch = null;
        const previousMicRoom = this.activeMicRoom;
        const primaryRoom = this.resolvePrimaryRoom();

        this.activeMicRoom = primaryRoom;
        // Rehome observers here as well: the later detachSecondaryRoom no-ops
        // its setActiveMicRoom call once activeMicRoom already points at the
        // primary room, so this is the only rehome on the exit path.
        if (primaryRoom) this.rehomeMicObservers(previousMicRoom, primaryRoom);
        this.activeMicRoomKey = PRIMARY_KEY;
        this.secondaryRoom = undefined;
        this.audioEnded();
      });
  }
}
