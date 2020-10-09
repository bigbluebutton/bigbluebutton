import Cursor from '/imports/ui/components/cursor/service';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';

const getCurrentCursor = (cursorId) => {
  const cursor = Cursor.findOne({ _id: cursorId });
  if (cursor) {
    const { userId } = cursor;
    const user = Users.findOne({ userId, connectionStatus: 'online' }, { fields: { name: 1 } });
    if (user) {
      cursor.userName = user.name;
      return cursor;
    }
  }
  return false;
};

const isPresenter = () => {
  const currentUser = Users.findOne({ userId: Auth.userID }, { fields: { presenter: 1 } });
  return currentUser ? currentUser.presenter : false;
};

const currentUserID = () => {
  return Auth.userID ;
};

const getMultiUserStatus = (whiteboardId) => {
  const data = WhiteboardMultiUser.findOne({ meetingId: Auth.meetingID, whiteboardId });
  return data ? data.multiUser : 0;
};

export default {
  getCurrentCursor,
  isPresenter,
  getMultiUserStatus,
  currentUserID,
};

