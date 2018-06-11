import { makeCall } from '/imports/ui/services/api';
import { publishCursorUpdate } from '/imports/ui/components/cursor/service';

const updateCursor = (coordinates) => {
  publishCursorUpdate(coordinates.xPercent, coordinates.yPercent);
};

export default {
  updateCursor,
};
