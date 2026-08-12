import { Room, type RoomOptions } from 'livekit-client';

export type MembershipKey = string; // 'primary' | `breakout-listen:${roomName}` | future kinds

export const PRIMARY_KEY: MembershipKey = 'primary';

class LiveKitRoomRegistry {
  private rooms = new Map<MembershipKey, Room>();

  acquire(key: MembershipKey, options?: RoomOptions): Room {
    let room = this.rooms.get(key);

    if (!room) {
      room = new Room(options);
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
      room = new Room();
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
