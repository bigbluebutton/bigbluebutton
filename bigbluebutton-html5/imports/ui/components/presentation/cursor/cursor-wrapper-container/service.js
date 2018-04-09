import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';
import Auth from '/imports/ui/services/auth';
import Cursor from '/imports/api/cursor';
import Users from '/imports/api/users';

const getMultiUserStatus = (whiteboardId) => {
  const data = WhiteboardMultiUser.findOne({ meetingId: Auth.meetingID, whiteboardId });
  return data ? data.multiUser : false;
};

const getPresenterCursorId = userId => Cursor.findOne({ userId }, { fields: { _id: 1 } });

const getCurrentCursorIds = (whiteboardId) => {
  // object to return
  const data = {};

  // fetching the presenter's id
  const user = Users.findOne({ presenter: true }, { fields: { userId: 1 } });

  if (user) {
    // fetching the presenter cursor id
    data.presenterCursorId = getPresenterCursorId(user.userId);
  }

  // checking whether multiUser mode is on or off
  const isMultiUser = getMultiUserStatus(whiteboardId);

  // it's a multi-user mode - fetching all the cursors except the presenter's
  if (isMultiUser) {
    let selector = {};
    const filter = {
      fields: {
        _id: 1,
      },
    };

    // if there is a presenter cursor - excluding it from the query
    if (data.presenterCursorId) {
      selector = {
        _id: {
          $ne: data.presenterCursorId._id,
        },
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
