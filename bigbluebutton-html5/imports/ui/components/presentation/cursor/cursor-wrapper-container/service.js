import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';
import PresentationPods from '/imports/api/presentation-pods';
import Auth from '/imports/ui/services/auth';
import Cursor from '/imports/ui/components/cursor/service';

import Users from '/imports/api/users';

const getMultiUserStatus = (whiteboardId) => {
  const data = WhiteboardMultiUser.findOne({ meetingId: Auth.meetingID, whiteboardId });
  return data ? data.multiUser : false;
};

const getPresenterCursorId = (whiteboardId, userId) =>
  Cursor.findOne(
    {
      whiteboardId,
      userId,
    },
    { fields: { _id: 1 } },
  );

const getCurrentCursorIds = (podId, whiteboardId) => {
  // object to return
  const data = {};

  // fetching the pod owner's id
  const pod = PresentationPods.findOne({ meetingId: Auth.meetingID, podId });
  if (pod) {
    // fetching the presenter cursor id
    data.presenterCursorId = getPresenterCursorId(whiteboardId, pod.currentPresenterId);
  }

  // checking whether multiUser mode is on or off
  const isMultiUser = getMultiUserStatus(whiteboardId);

  // it's a multi-user mode - fetching all the cursors except the presenter's
  if (isMultiUser) {
    const selector = { whiteboardId };
    const filter = {
      fields: {
        _id: 1,
      },
    };

    // if there is a presenter cursor - excluding it from the query
    if (data.presenterCursorId) {
      selector._id = {
        $ne: data.presenterCursorId._id,
      };
    }

    data.multiUserCursorIds = Cursor.find(selector, filter).fetch();
  } else {
    // it's not multi-user, assigning an empty array
    data.multiUserCursorIds = [];
  }

  return data;
};

export default {
  getCurrentCursorIds,
  getMultiUserStatus,
};
