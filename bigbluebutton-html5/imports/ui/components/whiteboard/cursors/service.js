import Auth from '/imports/ui/services/auth';
import { throttle } from '/imports/utils/throttle';
import { makeCall } from '/imports/ui/services/api';

const { cursorInterval: CURSOR_INTERVAL } = Meteor.settings.public.whiteboard;

const publishCursorUpdate = throttle(
  (payload) => makeCall('publishCursorUpdate', Auth.meetingID, Auth.userID, payload),
  CURSOR_INTERVAL,
);

export default {
  publishCursorUpdate,
};
