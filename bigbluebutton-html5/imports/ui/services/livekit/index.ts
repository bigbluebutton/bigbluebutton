import {
  Room,
} from 'livekit-client';

export const liveKitRoom: Room = new Room();

export const getLKStats = async (): Promise<Map<string, unknown>> => {
  const { localParticipant } = liveKitRoom;

  const statsMap: Map<string, unknown> = new Map();

  if (localParticipant?.engine?.pcManager?.publisher) {
    const senderStats = await localParticipant.engine.pcManager.publisher.getStats();
    senderStats.forEach((stat) => {
      statsMap.set(stat.id, stat);
    });
  }

  if (localParticipant?.engine?.pcManager?.subscriber) {
    const receiverStats = await localParticipant.engine.pcManager.subscriber.getStats();
    receiverStats.forEach((stat) => {
      statsMap.set(stat.id, stat);
    });
  }

  return statsMap;
};

export default {
  liveKitRoom,
  getLKStats,
};
