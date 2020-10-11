import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';

const DRAW_SETTINGS = 'drawSettings';

const isPresenter = () => {
  const currentUser = Users.findOne({ userId: Auth.userID }, { fields: { presenter: 1 } });
  return currentUser ? currentUser.presenter : false;
};

const isHePresenter = (somebody) => {
  const he = Users.findOne({ userId: somebody }, { fields: { presenter: 1 } });
  return he ? he.presenter : false;
};

const currentUserID = () => {
  return Auth.userID ;
};

const getMultiUserStatus = (whiteboardId) => {
  const data = WhiteboardMultiUser.findOne({ meetingId: Auth.meetingID, whiteboardId });
  return data ? data.multiUser : 0;
};

export default {
  isPresenter,
  isHePresenter,
  getMultiUserStatus,
  currentUserID,
};
