import AuthSingleton from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';
import { callServer } from '/imports/ui/services/api/index.js';

let getUserData = () => {
  // Get userId and meetingId
  const userId = AuthSingleton.getCredentials().requesterUserId;
  const meetingId = AuthSingleton.getCredentials().meetingId;

  // Find the user object of this specific meeting and userid
  const currentUser = Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });

  let isUserPresenter;
  if (currentUser && currentUser.user) {
    isUserPresenter = currentUser.user.presenter;
  }

  return {
    isUserPresenter: isUserPresenter,
  };
};

const updateCursor = (testArgument) => {
  callServer('publishCursorUpdate', testArgument);
};

export default {
  updateCursor,
  getUserData,
};
