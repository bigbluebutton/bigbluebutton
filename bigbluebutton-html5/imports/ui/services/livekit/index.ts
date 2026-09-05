import {
  ConnectionState,
  DisconnectReason,
  RoomEvent,
  Track,
  type InternalRoomOptions,
  type Room,
  type LocalTrackPublication,
  type TrackPublication,
  type RemoteTrack,
} from 'livekit-client';
import logger from '/imports/startup/client/logger';
import { hasConnectedOnce, liveKitRoomRegistry } from './registry';
import type { MembershipKey } from './registry';

export const LK_FATAL_ERROR_EVENT = 'liveKitFatalError';

// Disconnection reasons that we intentionally do not flag as "orphaning"
// the room as they are initiated by us (the client) and its cleanup
// should be handled by the teardown callers instead.
const NON_ORPHANING_DISCONNECT_REASONS: DisconnectReason[] = [
  // We did it
  DisconnectReason.CLIENT_INITIATED,
  // A new conneciton superseded this one, so the room is no longer usable.
  DisconnectReason.DUPLICATE_IDENTITY,
];

export const isOrphaningDisconnect = (reason?: DisconnectReason): boolean => {
  return reason === undefined || !NON_ORPHANING_DISCONNECT_REASONS.includes(reason);
};

export const DEFAULT_ROOM_OPTIONS: Partial<InternalRoomOptions> = {
  adaptiveStream: true,
  dynacast: true,
  stopLocalTrackOnUnpublish: false,
};

export interface LiveKitFatalErrorDetail {
  key: MembershipKey;
  source: string;
  error: Error;
}

// Expose the main room instance for E2E testing, but only when a test
// explicitly opts in before load (via Playwright's addInitScript with
// BBB_EXPOSE_LIVEKIT_ROOM set to true).
declare global {
  interface Window {
    liveKitRoom?: Room;
    liveKitRooms?: typeof liveKitRoomRegistry;
    BBB_EXPOSE_LIVEKIT_ROOM?: boolean;
  }
}

if (typeof window !== 'undefined' && window.BBB_EXPOSE_LIVEKIT_ROOM) {
  Object.defineProperty(window, 'liveKitRoom', {
    get: () => liveKitRoomRegistry.getPrimary(),
    configurable: true,
  });
  window.liveKitRooms = liveKitRoomRegistry;
}

// How long a room may stay unusable before the caller gives up on it.
export const ROOM_CONNECTION_TIMEOUT = 15000;

/*
 * Resolves once `room` can carry media, rejects once it never will.
 *
 * A fresh connect ends in Connected and an SDK resume in Reconnected, with the
 * state pinned at Reconnecting in between, so both events have to be watched
 * or an operation fired mid-resume waits the timeout instead of proceeding
 * when the session comes back. Disconnected ends the wait whatever its reason:
 * the SDK only emits it after tearing the room down (publications and
 * participants cleared), and a resume never reaches that point, so neither
 * event can arrive afterwards, and only a fresh connect revives the room.
 */
export const waitForRoomConnection = (
  room: Room | undefined,
  timeout = ROOM_CONNECTION_TIMEOUT,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!room) {
      reject(new Error('LiveKit room not available'));

      return;
    }

    if (room.state === ConnectionState.Connected) {
      resolve();

      return;
    }

    // A room torn down before the wait started gets no further events either.
    // A room that has simply not connected yet reports the same state, so only
    // abort for one that has been connected before.
    if (room.state === ConnectionState.Disconnected && hasConnectedOnce(room)) {
      reject(new Error('Room already disconnected'));

      return;
    }

    const cleanup = () => {
      clearTimeout(timer);
      room.off(RoomEvent.Connected, onConnected);
      room.off(RoomEvent.Reconnected, onConnected);
      room.off(RoomEvent.Disconnected, onDisconnected);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Room connection timeout'));
    }, timeout);
    const onConnected = () => {
      cleanup();
      resolve();
    };
    const onDisconnected = (reason?: DisconnectReason) => {
      cleanup();
      reject(new Error(`Room disconnected while waiting for connection (reason=${reason})`));
    };

    room.once(RoomEvent.Connected, onConnected);
    room.once(RoomEvent.Reconnected, onConnected);
    room.once(RoomEvent.Disconnected, onDisconnected);
  });
};

export const lkIsCameraSource = (track: TrackPublication | RemoteTrack): boolean => {
  return track.kind === Track.Kind.Video && track.source === Track.Source.Camera;
};

export const isLiveKitBridge = (bridgeName: string): boolean => {
  return bridgeName === 'livekit';
};

export const lkToggleMuteCameras = (mute: boolean): void => {
  const room = liveKitRoomRegistry.getPrimary();
  const localParticipant = room?.localParticipant;

  if (!localParticipant?.videoTrackPublications || localParticipant.videoTrackPublications.size === 0) {
    return;
  }

  localParticipant.videoTrackPublications.forEach((publication: LocalTrackPublication) => {
    if (lkIsCameraSource(publication) && publication.isMuted !== mute) {
      if (mute) {
        publication.mute();
      } else {
        publication.unmute();
      }

      logger.info({
        logCode: 'livekit_camera_toggle_mute',
        extraInfo: {
          trackName: publication?.trackName,
          trackSid: publication?.trackSid,
          mute,
        },
      }, `LiveKit: camera track ${mute ? 'muted' : 'unmuted'} - ${publication?.trackSid}`);
    }
  });
};

export {
  liveKitRoomRegistry,
  PRIMARY_KEY,
  breakoutListenKey,
} from './registry';
export type { MembershipKey } from './registry';

export default {
  LK_FATAL_ERROR_EVENT,
  lkIsCameraSource,
  lkToggleMuteCameras,
};
