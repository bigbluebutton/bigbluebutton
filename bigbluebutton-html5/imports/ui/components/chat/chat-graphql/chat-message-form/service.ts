/* eslint-disable @typescript-eslint/ban-ts-comment */
import { makeCall } from '/imports/ui/services/api';
import { throttle } from '/imports/utils/throttle';

const START_TYPING_THROTTLE_INTERVAL = 1000;

// session for closed chat list

export const startUserTyping = throttle(
  (chatId: string) => {
    makeCall('startUserTyping', chatId);
  },
  START_TYPING_THROTTLE_INTERVAL,
  { leading: true, trailing: false },
);
export const stopUserTyping = () => makeCall('stopUserTyping');

export default {
  startUserTyping,
  stopUserTyping,
};
