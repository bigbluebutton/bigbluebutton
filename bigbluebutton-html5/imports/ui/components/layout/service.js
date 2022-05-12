import { makeCall } from '/imports/ui/services/api';

const setMeetingLayout = (options) => {

  makeCall('changeLayout', options)
};

export default {
  setMeetingLayout,
};
