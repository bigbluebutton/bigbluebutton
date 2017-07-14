import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/2.0/users';

const getUserData = () => {
  // Get userId and meetingId
  const credentials = Auth.credentials;

  // Find the user object of this specific meeting and userid
  const currentUser = Users.findOne({
    meetingId: credentials.meetingId,
    userId: credentials.requesterUserId,
  });

  let isUserPresenter;
  if (currentUser && currentUser.user) {
    isUserPresenter = currentUser.user.presenter;
  }

  return {
    isUserPresenter,
  };
};

const updateCursor = (coordinates) => {
  makeCall('publishCursorUpdate', coordinates);
};

export default {
  updateCursor,
  getUserData,
};
