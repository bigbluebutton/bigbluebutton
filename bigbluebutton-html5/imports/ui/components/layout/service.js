import { makeCall } from '/imports/ui/services/api';

const setPushLayout = (pushLayout) => {
  makeCall('setPushLayout', { pushLayout });
};

const setMeetingLayout = (options) => {
  makeCall('changeLayout', options)
};

export default {
  setPushLayout,
  setMeetingLayout,
};
