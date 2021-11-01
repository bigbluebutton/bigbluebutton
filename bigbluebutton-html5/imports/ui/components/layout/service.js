import { makeCall } from '/imports/ui/services/api';

const setMeetingLayout = newValue => makeCall('changeLayout', newValue);

export default {
  setMeetingLayout,
};
