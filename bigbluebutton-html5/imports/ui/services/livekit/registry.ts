import { Room, RoomEvent, type RoomOptions } from 'livekit-client';

export type MembershipKey = string; // 'primary' | `breakout-listen:${roomName}` | future kinds

export const PRIMARY_KEY: MembershipKey = 'primary';

// A Room reports 'disconnected' both before it has ever connected and after it
// has been torn down. Only the second state is final, and callers waiting on a
// room need to tell them apart, so remember which rooms have connected.
const connectedOnce = new WeakSet<Room>();

export const hasConnectedOnce = (room: Room): boolean => connectedOnce.has(room);

const trackConnections = (room: Room): Room => {
  room.once(RoomEvent.Connected, () => connectedOnce.add(room));

  return room;
};

class LiveKitRoomRegistry {
  private rooms = new Map<MembershipKey, Room>();

  acquire(key: MembershipKey, options?: RoomOptions): Room {
    let room = this.rooms.get(key);

    if (!room) {
      room = trackConnections(new Room(options));
      this.rooms.set(key, room);
    } else if (options) {
      room.options = { ...room.options, ...options };
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
    let room = this.rooms.get(PRIMARY_KEY);

    if (!room) {
      room = trackConnections(new Room());
      this.rooms.set(PRIMARY_KEY, room);
    }

    return room;
  }

  has(key: MembershipKey): boolean {
    return this.rooms.has(key);
  }
}

export const liveKitRoomRegistry = new LiveKitRoomRegistry();

export const breakoutListenKey = (roomName: string): MembershipKey => `breakout-listen:${roomName}`;
