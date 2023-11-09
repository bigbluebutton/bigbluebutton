import { makeCall } from '/imports/ui/services/api';

let lastMessage: {
  event: string;
  rate: number;
  time: number;
  state?: string;
} = { event: '', rate: 0, time: 0 };

export const sendMessage = (event: string, data: { rate: number; time: number; state?: string}) => {
  // don't re-send repeated update messages
  if (
    lastMessage.event === event
    && lastMessage.time === data.time
  ) {
    return;
  }

  // don't register to redis a viewer joined message
  if (event === 'viewerJoined') {
    return;
  }

  lastMessage = { ...data, event };

  // Use an integer for playing state
  // 0: stopped 1: playing
  // We might use more states in the future
  const state = data.state ? 1 : 0;

  makeCall('emitExternalVideoEvent', { status: event, playerStatus: { ...data, state } });
};

export default {
  sendMessage,
};
