import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth/index';

const isSharingVideo = () => {
  const userId = Auth.userID;
  const user = Users.findOne({ userId: userId });
  return user.has_stream ? true : false;
};

export default {
  isSharingVideo
};
