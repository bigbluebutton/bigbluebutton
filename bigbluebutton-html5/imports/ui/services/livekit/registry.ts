import {
  Room,
  RoomEvent,
  type InternalRoomOptions,
  type RoomOptions,
} from 'livekit-client';

export type MembershipKey = string; // 'primary' | `breakout-listen:${roomName}` | future kinds

export const PRIMARY_KEY: MembershipKey = 'primary';

export const DEFAULT_ROOM_OPTIONS: Partial<InternalRoomOptions> = {
  adaptiveStream: true,
  dynacast: true,
  singlePeerConnection: false,
  stopLocalTrackOnUnpublish: false,
};

// A deployment override may carry only some of the keys; the rest keep the
// shipped defaults rather than the SDK's.
export const resolveRoomOptions = (configured?: Partial<InternalRoomOptions>): RoomOptions => ({
  ...DEFAULT_ROOM_OPTIONS,
  ...configured,
});

// A Room reports 'disconnected' both before it has ever connected and after it
// has been torn down. Only the second state is final, and callers waiting on a
// room need to tell them apart, so remember which rooms have connected.
const connectedOnce = new WeakSet<Room>();

export const hasConnectedOnce = (room: Room): boolean => connectedOnce.has(room);

const trackConnections = (room: Room): Room => {
  room.once(RoomEvent.Connected, () => connectedOnce.add(room));

  return room;
};

// livekit-client hands the Room's options object to its LocalParticipant by
// reference at construction and reads the publish-time knobs (dynacast,
// stopLocalTrackOnUnpublish, publishDefaults) from that same object, so
// options are merged into it, never swapped for a new object.
export const applyRoomOptions = (room: Room, options?: RoomOptions): void => {
  if (options) Object.assign(room.options, options);
};

// The primary room is created on first touch by whoever asks for it (audio
// bridge, audio-state hooks), before any membership carries options.
const configuredRoomOptions = (): RoomOptions => (
  resolveRoomOptions(window.meetingClientSettings?.public?.media?.livekit?.roomOptions)
);

class LiveKitRoomRegistry {
  private rooms = new Map<MembershipKey, Room>();

  acquire(key: MembershipKey, options?: RoomOptions): Room {
    let room = this.rooms.get(key);

    if (!room) {
      room = trackConnections(new Room(options ?? configuredRoomOptions()));
      this.rooms.set(key, room);
    } else {
      applyRoomOptions(room, options);
    }

    return room;
  }

  release(key: MembershipKey): void {
    const room = this.rooms.get(key);

    if (!room) return;

    this.rooms.delete(key);
    room.disconnect().catch(() => {});
  }

  get(key: MembershipKey): Room | undefined {
    return this.rooms.get(key);
  }

  getRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getPrimary(): Room {
    return this.acquire(PRIMARY_KEY);
  }

  has(key: MembershipKey): boolean {
    return this.rooms.has(key);
  }
}

export const liveKitRoomRegistry = new LiveKitRoomRegistry();

export const breakoutListenKey = (roomName: string): MembershipKey => `breakout-listen:${roomName}`;
