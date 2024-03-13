import { makeCall } from '/imports/ui/services/api';

export const requestJoinURL = (breakoutId: string) => {
  makeCall('requestJoinURL', {
    breakoutId,
  });
};

export default {
  requestJoinURL,
};
