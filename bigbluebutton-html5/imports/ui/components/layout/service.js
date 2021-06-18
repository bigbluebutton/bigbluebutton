import { makeCall } from '/imports/ui/services/api';

const setMeetingLayout = newValue => makeCall('changeLayout', newValue);
const setMeetingLayoutManager = newValue => makeCall('changeLayoutManager', newValue);

export default {
  setMeetingLayoutManager,
  setMeetingLayout,
};
