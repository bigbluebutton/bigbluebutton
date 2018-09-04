import { makeCall } from '/imports/ui/services/api';
import { publishCursorUpdate } from '/imports/ui/components/cursor/service';

const updateCursor = (payload) => {
  publishCursorUpdate(payload);
};

export default {
  updateCursor,
};
