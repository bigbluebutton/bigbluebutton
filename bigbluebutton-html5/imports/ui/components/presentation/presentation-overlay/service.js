import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';

let getUserData = () => {
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
    isUserPresenter: isUserPresenter,
  };
};

const updateCursor = (coordinates) => {
  makeCall('publishCursorUpdate', coordinates);
};

export default {
  updateCursor,
  getUserData,
};
