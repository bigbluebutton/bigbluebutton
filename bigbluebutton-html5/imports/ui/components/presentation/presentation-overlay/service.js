import { makeCall } from '/imports/ui/services/api';

const updateCursor = (coordinates) => {
  makeCall('publishCursorUpdate', coordinates);
};

export default {
  updateCursor,
};
