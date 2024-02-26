import { makeCall } from '/imports/ui/services/api';
import { debounce } from '/imports/utils/debounce';

const setPushLayout = (pushLayout) => {
  makeCall('setPushLayout', { pushLayout });
};

const setMeetingLayout = (options) => {
  makeCall('changeLayout', options);
};

export default {
  setPushLayout,
  setMeetingLayout: debounce(setMeetingLayout, 1000),
};
