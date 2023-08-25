import { makeCall } from '/imports/ui/services/api';

export const toggleVideoPin = (userId: string, userIsPinned: boolean) => {
  makeCall('changePin', userId, !userIsPinned);
};

export default {
  toggleVideoPin,
};
