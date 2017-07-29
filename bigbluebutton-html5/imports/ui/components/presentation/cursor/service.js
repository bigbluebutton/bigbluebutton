import Cursor from '/imports/api/2.0/cursor';
import Users from '/imports/api/2.0/users';

const getCurrentCursor = () => {
  const user = Users.findOne({ 'user.presenter': true });
  if (user) {
    return Cursor.findOne({ userId: user.userId });
  }

  return false;
};

export default {
  getCurrentCursor,
};
